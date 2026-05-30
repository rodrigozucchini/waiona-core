```ts
@Injectable()
export class CategoryService {
  constructor(
    // Repositorio principal para operaciones CRUD sobre categorías.
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,

    // Se inyectan los repositorios de Product y Combo para validar dependencias
    // antes de borrar una categoría. Sin esto, el delete podría dejar productos
    // o combos huérfanos (FK sin padre).
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    @InjectRepository(ComboEntity)
    private readonly comboRepository: Repository<ComboEntity>,

    // Invalida la caché del shop cuando cambia la estructura de categorías,
    // porque el cliente las ve en el catálogo.
    private readonly shopCacheService: ShopCacheService,
  ) {}

  // ─── FIND ALL (plano, paginado) ──────────────────────────────────────────────

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponseDto<CategoryResponseDto>> {
    // findAndCount en una sola query: evita hacer count() por separado.
    // No carga relaciones (parentId es suficiente para el listado plano).
    const [entities, total] = await this.categoryRepository.findAndCount({
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return new PaginatedResponseDto(
      entities.map((e) => new CategoryResponseDto(e)),
      total,
      page,
      limit,
    );
  }

  // ─── FIND BY ID ──────────────────────────────────────────────────────────────

  async findById(id: number): Promise<CategoryResponseDto> {
    const entity = await this.findOne(id);
    return new CategoryResponseDto(entity);
  }

  // ─── CREATE ──────────────────────────────────────────────────────────────────

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    let parent: CategoryEntity | null = null;

    if (dto.parentId) {
      // Validación explícita del padre antes de insertar: da un 400 claro
      // si el parentId no existe, en vez de dejar fallar la FK de la DB.
      parent = await this.categoryRepository.findOne({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new BadRequestException(
          `Categoría padre con id ${dto.parentId} no encontrada`,
        );
      }
    }

    const entity = this.categoryRepository.create({
      name: dto.name,
      description: dto.description,
      isActive: dto.isActive ?? true, // ?? true: si no viene en el DTO, la categoría es activa por defecto.
      parentId: parent ? parent.id : null,
    });

    const saved = await this.categoryRepository.save(entity);
    void this.shopCacheService.invalidate(); // Fire-and-forget: no bloquea la respuesta.
    return new CategoryResponseDto(saved);
  }

  // ─── UPDATE ──────────────────────────────────────────────────────────────────

  async update(
    id: number,
    changes: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const entity = await this.findOne(id);

    if (changes.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: changes.parentId },
      });

      if (!parent) {
        throw new BadRequestException(
          `Categoría padre con id ${changes.parentId} no encontrada`,
        );
      }

      // Detección de ciclos: si se asignara a sí misma o a un descendiente
      // como padre, se crearía una referencia circular que rompería el árbol.
      // wouldCreateCycle recorre la cadena de padres hacia arriba buscando el id.
      if (await this.wouldCreateCycle(id, changes.parentId)) {
        throw new BadRequestException(
          'Asignar esta categoría padre crearía una jerarquía circular',
        );
      }
    }

    const merged = this.categoryRepository.merge(entity, changes);
    const saved = await this.categoryRepository.save(merged);
    void this.shopCacheService.invalidate();
    return new CategoryResponseDto(saved);
  }

  // ─── SOFT DELETE ─────────────────────────────────────────────────────────────

  async delete(id: number): Promise<void> {
    const entity = await this.findOne(id);

    // Bloquea el delete si hay productos asignados a esta categoría.
    // Se hace en la capa de aplicación (no con FK ON DELETE RESTRICT)
    // para poder devolver un error descriptivo con el conteo real.
    const productCount = await this.productRepository.count({
      where: { categoryId: id },
    });
    if (productCount > 0) {
      throw new ConflictException(
        `No se puede eliminar: la categoría tiene ${productCount} producto(s) asignado(s)`,
      );
    }

    const comboCount = await this.comboRepository.count({
      where: { categoryId: id },
    });
    if (comboCount > 0) {
      throw new ConflictException(
        `No se puede eliminar: la categoría tiene ${comboCount} combo(s) asignado(s)`,
      );
    }

    await this.categoryRepository.softDelete(entity.id);
    void this.shopCacheService.invalidate();
  }

  // ─── TREE ────────────────────────────────────────────────────────────────────

  async getTree(): Promise<CategoryTreeResponseDto[]> {
    // Carga todas las categorías en una sola query y construye el árbol en memoria.
    // Alternativa sería usar TypeORM Tree (closure table), pero requiere migración
    // de schema. Este enfoque in-memory es suficiente para la cantidad de categorías
    // esperada en un e-commerce pequeño/mediano.
    const all = await this.categoryRepository.find({
      order: { name: 'ASC' },
    });

    for (const cat of all) {
      cat.children = [];
    }

    // Mapa id → entidad para lookup O(1) al construir el árbol.
    const map = new Map(all.map((cat) => [cat.id, cat]));
    const roots: CategoryEntity[] = [];

    for (const cat of all) {
      if (cat.parentId != null) {
        map.get(cat.parentId)?.children?.push(cat);
      } else {
        roots.push(cat);
      }
    }

    return roots.map((root) => new CategoryTreeResponseDto(root));
  }

  // ─── PRIVATE ─────────────────────────────────────────────────────────────────

  private async wouldCreateCycle(
    categoryId: number,
    newParentId: number,
  ): Promise<boolean> {
    // Recorre la cadena de padres del newParentId hacia arriba.
    // Si en algún punto el currentId es igual a categoryId, se detectó un ciclo.
    let currentId: number | null = newParentId;
    while (currentId !== null) {
      if (currentId === categoryId) return true;
      const cat = await this.categoryRepository.findOne({
        where: { id: currentId },
      });
      currentId = cat?.parentId ?? null;
    }
    return false;
  }

  private async findOne(id: number): Promise<CategoryEntity> {
    const entity = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(`Categoría con id ${id} no encontrada`);
    }

    return entity;
  }
}
```
