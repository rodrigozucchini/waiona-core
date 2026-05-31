```ts
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,

    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,

    // Tabla separada de refresh tokens — no se guarda el token en claro,
    // solo su hash SHA-256. Permite revocar sesiones individuales o masivas
    // sin invalidar el JWT (que no tiene estado en el servidor).
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepo: Repository<RefreshTokenEntity>,
  ) {}

  // ==========================
  // validateUser — usado por LocalStrategy en POST /auth/login
  // ==========================

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.usersService.findByEmail(email);

    // Mismo mensaje para user no encontrado y password incorrecta —
    // evita que un atacante enumere emails registrados por diferencia de error.
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Credenciales inválidas');

    // isActive se verifica DESPUÉS del bcrypt.compare para no revelar
    // si la cuenta existe antes de validar la contraseña.
    if (!user.isActive) {
      throw new UnauthorizedException('La cuenta no está activada');
    }

    return user;
  }

  // ==========================
  // refresh — rotation de refresh token
  // ==========================

  async refresh(rawToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const tokenEntity = await this.findValidRefreshToken(rawToken);

    // ORDEN CRÍTICO: emitir nuevos tokens ANTES de revocar el viejo.
    // Si issueRefreshToken falla (ej: error de DB), el cliente todavía tiene
    // el token anterior válido y puede reintentar sin quedar bloqueado.
    // Si primero se revocara y luego fallara la emisión, el cliente perdería acceso.
    const user = await this.usersService.findOne(tokenEntity.userId);
    const payload: Payload = { sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = await this.issueRefreshToken(user.id);

    // Solo se revoca el viejo token una vez confirmado que el nuevo existe en DB.
    tokenEntity.revokedAt = new Date();
    await this.refreshTokenRepo.save(tokenEntity);

    return { access_token, refresh_token };
  }

  // ==========================
  // changePassword — requiere JWT, valida contraseña actual
  // ==========================

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    // findEntityWithPassword usa addSelect('user.password') porque la columna
    // tiene select: false en la entidad — no se expone en queries normales.
    const user = await this.usersService.findEntityWithPassword(userId);

    if (!user) throw new BadRequestException('Usuario no encontrado');

    const passwordMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!passwordMatch)
      throw new BadRequestException('La contraseña actual es incorrecta');

    await this.usersService.updatePassword(userId, dto.newPassword);
  }

  // ==========================
  // PRIVATE — issueRefreshToken
  // ==========================

  private async issueRefreshToken(userId: number): Promise<string> {
    const raw = randomBytes(64).toString('hex');
    // Solo el hash SHA-256 se persiste — el raw nunca toca la DB.
    // Si la tabla de refresh tokens se filtrara, los tokens no son recuperables.
    const tokenHash = createHash('sha256').update(raw).digest('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    const entity = this.refreshTokenRepo.create({ userId, tokenHash, expiresAt, revokedAt: null });
    await this.refreshTokenRepo.save(entity);

    return raw; // solo se devuelve una vez al cliente, nunca se vuelve a ver
  }

  // ==========================
  // PRIVATE — findValidRefreshToken
  // ==========================

  private async findValidRefreshToken(rawToken: string): Promise<RefreshTokenEntity> {
    // El lookup se hace por hash — el token en claro nunca se almacena.
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const entity = await this.refreshTokenRepo.findOne({ where: { tokenHash } });

    // Tres validaciones separadas para mensajes de error distintos en logs,
    // aunque al cliente se le devuelve el mismo 401 en los tres casos.
    if (!entity) throw new UnauthorizedException('Token de refresco inválido');
    if (entity.isRevoked) throw new UnauthorizedException('El token de refresco fue revocado');
    if (entity.isExpired) throw new UnauthorizedException('El token de refresco ha expirado');

    return entity;
  }

  // ==========================
  // PRIVATE — findValidToken (tokens de email: activación y reset)
  // ==========================

  private async findValidToken(raw: string, type: TokenType): Promise<TokenEntity> {
    const tokenEntity = await this.tokenRepo.findOne({ where: { token: raw, type } });

    // Un solo mensaje genérico para "no existe" — evita oracle de existencia.
    if (!tokenEntity) throw new BadRequestException('Token inválido o expirado');
    if (tokenEntity.isUsed) throw new BadRequestException('El token ya fue utilizado');
    if (tokenEntity.isExpired) throw new BadRequestException('El token ha expirado');

    return tokenEntity;
  }
}
```
