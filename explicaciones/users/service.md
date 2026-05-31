```ts
@Injectable()
export class UsersService {

  // ==========================
  // findByEmail — usado por LocalStrategy en login
  // ==========================

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo
      .createQueryBuilder('user')
      // password tiene select: false en la entidad — nunca sale en queries normales.
      // Aquí se expone explícitamente porque LocalStrategy necesita el hash para bcrypt.compare().
      .addSelect('user.password')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.email = :email', { email })
      .andWhere('user.deletedAt IS NULL')
      .getOne();
  }

  // ==========================
  // findAll — búsqueda paginada de usuarios (admin)
  // ==========================

  async findAll(dto?, page = 1, limit = 20) {
    // Dos paths porque findAndCount con relaciones anidadas puede devolver
    // conteos incorrectos cuando se filtra por columnas de la entidad relacionada (profile).
    // QueryBuilder da control total sobre los joins y el count.
    if (dto?.name) {
      const qb = this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.profile', 'profile')
        .leftJoinAndSelect('user.role', 'role')
        .where('(profile.name ILIKE :name OR profile.last_name ILIKE :name)', { name: `%${dto.name}%` });

      // email es opcional y se puede combinar con name (AND)
      if (dto.email) {
        qb.andWhere('user.email ILIKE :email', { email: `%${dto.email}%` });
      }
      // ...
    }

    // Path sin filtro de nombre: usa findAndCount que es más simple y correcto
    // cuando el filtro es solo por columna directa de UserEntity (email).
    const where: FindOptionsWhere<UserEntity> = {};
    if (dto?.email) where.email = ILike(`%${dto.email}%`);
    // email acepta fragmentos parciales — @IsString() en el DTO (no @IsEmail())
    // para permitir búsquedas tipo ?email=test o ?email=juan@
  }

  // ==========================
  // create — transacción atómica user + profile
  // ==========================

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    // Validación previa de email único — el try/catch dentro de la transacción
    // también atrapa el error de unique constraint (código 23505) por si hay
    // race condition entre la validación y el INSERT.
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('El email ya está en uso');

    const saved = await this.dataSource.transaction(async (manager) => {
      // Profile y User se crean en la misma transacción — si falla el save del user
      // (ej: unique constraint), el profile no queda huérfano en la DB.
      const profile = manager.create(ProfileEntity, { name: dto.name, lastName: dto.lastName, avatar: dto.avatar ?? null });
      const user = manager.create(UserEntity, { email: dto.email, password: dto.password, profile, role: clientRole ?? undefined });

      try {
        return await manager.save(UserEntity, user);
      } catch (err: any) {
        // race condition: dos requests simultáneos con el mismo email pasan
        // la validación previa pero uno falla en el INSERT por unique constraint
        if (err.code === '23505') throw new ConflictException('El email ya está en uso');
        throw err;
      }
    });
  }

  // ==========================
  // update — actualiza solo el profile (no email ni password)
  // ==========================

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.findEntity(id);

    // Solo se asignan los campos que vienen en el body (undefined = no enviado = no toca).
    // avatar: null se asigna explícitamente para limpiar el valor — se diferencia
    // de undefined (no enviado) vs null (enviado para borrar).
    Object.assign(user.profile, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      ...(dto.avatar !== undefined && { avatar: dto.avatar }),
    });

    // userRepo.save() con cascade: true persiste también el profile modificado.
    // No hace falta un repo de ProfileEntity.
    const saved = await this.userRepo.save(user);
    return new UserResponseDto(saved);
  }

  // ==========================
  // findEntityWithPassword — expone hash, solo para AuthService
  // ==========================

  async findEntityWithPassword(id: number): Promise<UserEntity | null> {
    // addSelect forzado porque password tiene select: false en la entidad —
    // nunca sale en queries normales para que no se filtren accidentalmente.
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();
    // TypeORM aplica deletedAt IS NULL automáticamente al usar createQueryBuilder
    // desde el repo (no desde dataSource).
  }

  // ==========================
  // PRIVATE findEntity — reutilizable internamente
  // ==========================

  private async findEntity(id: number): Promise<UserEntity> {
    // findOne del repo aplica deletedAt IS NULL automáticamente
    // gracias a @DeleteDateColumn en BaseEntity.
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    return user;
  }
}
```
