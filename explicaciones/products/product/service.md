```ts
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    // Se inyecta el repositorio de Category para validar que la categoría
    // exista antes de crear o reasignar un producto. Sin esto, un categoryId
    // inválido solo fallaría en la FK de la DB con un mensaje poco descriptivo.
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,

    // Invalida la caché del shop cuando cambia un producto,
    // porque los cambios afectan el catálogo que ve el cliente.
    private readonly shopCacheService: ShopCacheService,
  ) {}

  // ─── FIND ALL ────────────────────────────────────────────────────────────────

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponseDto<ProductResponseDto>> {
    // Carga la relación 'category' para que el DTO pueda exponer el nombre
    // de la categoría, no solo su id.
    const [products, total] = await this.productRepository.findAndCount({
      relations: ['category'],
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return new PaginatedResponseDto(
      products.map((product) => new ProductResponseDto(product)),
      total,
      page,
      limit,
    );
  }

  // ─── FIND BY ID ──────────────────────────────────────────────────────────────

  async findById(id: number): Promise<ProductResponseDto> {
    const product = await this.findOne(id);
    return new ProductResponseDto(product);
  }

  // ─── CREATE ──────────────────────────────────────────────────────────────────

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    await this.validateCategoryExists(dto.categoryId);

    // Unicidad del SKU: se valida en la capa de aplicación para devolver
    // un 409 claro en vez de dejar que la constraint UNIQUE de la DB arroje
    // un error genérico de PG.
    const existingSku = await this.productRepository.findOne({
      where: { sku: dto.sku },
    });

    if (existingSku) {
      throw new ConflictException(`Ya existe un producto con el SKU ${dto.sku}`);
    }

    const product = this.productRepository.create({
      ...dto,
      sku: dto.sku.toUpperCase(), // SKU siempre en mayúsculas para normalizar búsquedas.
      isActive: dto.isActive ?? true,
    });

    const saved = await this.productRepository.save(product);
    void this.shopCacheService.invalidate(); // Fire-and-forget: no bloquea la respuesta.

    // Se re-fetchea con findOne para cargar la relación 'category' que .save() no incluye.
    return new ProductResponseDto(await this.findOne(saved.id));
  }

  // ─── UPDATE ──────────────────────────────────────────────────────────────────

  async update(
    id: number,
    changes: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.findOne(id);

    if (changes.categoryId !== undefined) {
      await this.validateCategoryExists(changes.categoryId);
    }

    if (changes.sku && changes.sku !== product.sku) {
      // Solo valida unicidad si el SKU realmente cambia.
      // Evita fallar si el cliente manda el mismo SKU en un PATCH.
      const existingSku = await this.productRepository.findOne({
        where: { sku: changes.sku },
      });

      if (existingSku) {
        throw new ConflictException(
          `Ya existe un producto con el SKU ${changes.sku}`,
        );
      }

      changes.sku = changes.sku.toUpperCase();
    }

    const merged = this.productRepository.merge(product, changes);
    await this.productRepository.save(merged);
    void this.shopCacheService.invalidate();

    // Re-fetch con relaciones para devolver el DTO completo.
    return new ProductResponseDto(await this.findOne(merged.id));
  }

  // ─── SOFT DELETE ─────────────────────────────────────────────────────────────

  async delete(id: number): Promise<void> {
    const product = await this.findOne(id);
    // Soft delete: setea deletedAt = NOW(). TypeORM aplica deletedAt IS NULL
    // automáticamente en find* futuros, por lo que el producto desaparece
    // del catálogo sin eliminar su historial en órdenes.
    await this.productRepository.softDelete(product.id);
    void this.shopCacheService.invalidate();
  }

  // ─── PRIVATE ─────────────────────────────────────────────────────────────────

  private async validateCategoryExists(categoryId: number): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new BadRequestException(`Categoría con id ${categoryId} no encontrada`);
    }
  }

  private async findOne(id: number): Promise<ProductEntity> {
    // Siempre carga 'category' para que el DTO de respuesta pueda exponer
    // los datos de la categoría sin necesidad de otra query en el caller.
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    return product;
  }
}
```
