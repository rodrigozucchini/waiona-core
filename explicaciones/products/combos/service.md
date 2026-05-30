```ts
@Injectable()
export class ComboService {
  constructor(
    @InjectRepository(ComboEntity)
    private readonly comboRepository: Repository<ComboEntity>,

    // ComboItemEntity es la tabla intermedia que relaciona combos con productos.
    // Se necesita un repositorio separado para poder soft-deletear los items
    // cuando se reemplazan en un update, sin perder el historial.
    @InjectRepository(ComboItemEntity)
    private readonly comboItemRepository: Repository<ComboItemEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,

    // DataSource para crear transacciones: combo + items se crean o modifican
    // juntos. Si falla la inserción de un item, no queda un combo huérfano.
    private readonly dataSource: DataSource,

    private readonly shopCacheService: ShopCacheService,
  ) {}

  // ─── FIND ALL ────────────────────────────────────────────────────────────────

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponseDto<ComboResponseDto>> {
    // Carga la jerarquía completa: combo → items → product de cada item.
    // Necesario para que el DTO incluya el nombre del producto en cada item.
    const [combos, total] = await this.comboRepository.findAndCount({
      relations: ['category', 'items', 'items.product'],
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return new PaginatedResponseDto(
      combos.map((combo) => new ComboResponseDto(combo)),
      total,
      page,
      limit,
    );
  }

  // ─── FIND BY ID ──────────────────────────────────────────────────────────────

  async findById(id: number): Promise<ComboResponseDto> {
    const combo = await this.findOne(id);
    return new ComboResponseDto(combo);
  }

  // ─── CREATE ──────────────────────────────────────────────────────────────────

  async create(dto: CreateComboDto): Promise<ComboResponseDto> {
    await this.validateCategoryExists(dto.categoryId);

    // Transacción: combo y sus items se insertan atómicamente.
    // Si la validación de items falla (producto no existe, duplicado),
    // el combo no queda persistido en la DB.
    const result = await this.dataSource.transaction(async (manager) => {
      await this.validateItems(dto.items);

      const combo = manager.create(ComboEntity, {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
        categoryId: dto.categoryId,
      });

      const savedCombo = await manager.save(combo);

      const items = dto.items.map((item) =>
        manager.create(ComboItemEntity, {
          comboId: savedCombo.id,
          productId: item.productId,
          quantity: item.quantity,
        }),
      );

      await manager.save(items);

      // Re-fetch dentro de la transacción para obtener el combo con relaciones,
      // ya que manager.save() no las carga.
      const fullCombo = await manager.findOne(ComboEntity, {
        where: { id: savedCombo.id },
        relations: ['category', 'items', 'items.product'],
      });

      return new ComboResponseDto(fullCombo!);
    });

    void this.shopCacheService.invalidate();
    return result;
  }

  // ─── UPDATE ──────────────────────────────────────────────────────────────────

  async update(id: number, dto: UpdateComboDto): Promise<ComboResponseDto> {
    if (dto.categoryId !== undefined) {
      await this.validateCategoryExists(dto.categoryId);
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const combo = await manager.findOne(ComboEntity, { where: { id } });

      if (!combo) {
        throw new NotFoundException(`Combo con id ${id} no encontrado`);
      }

      manager.merge(ComboEntity, combo, {
        name: dto.name ?? combo.name,
        description: dto.description ?? combo.description,
        isActive: dto.isActive ?? combo.isActive,
        categoryId: dto.categoryId ?? combo.categoryId,
      });

      await manager.save(combo);

      if (dto.items) {
        await this.validateItems(dto.items);

        // Reemplazo de items: soft-delete de los actuales + insert de los nuevos.
        // Se usa soft-delete (no delete físico) para mantener el historial.
        // No hay PATCH parcial de items: se reemplaza la lista completa para
        // evitar estados inconsistentes (item con productId inválido sobreviviendo).
        await manager.softDelete(ComboItemEntity, { comboId: combo.id });

        const newItems = dto.items.map((item) =>
          manager.create(ComboItemEntity, {
            comboId: combo.id,
            productId: item.productId,
            quantity: item.quantity,
          }),
        );

        await manager.save(newItems);
      }

      const fullCombo = await manager.findOne(ComboEntity, {
        where: { id: combo.id },
        relations: ['category', 'items', 'items.product'],
      });

      return new ComboResponseDto(fullCombo!);
    });

    void this.shopCacheService.invalidate();
    return result;
  }

  // ─── SOFT DELETE ─────────────────────────────────────────────────────────────

  async delete(id: number): Promise<void> {
    const combo = await this.comboRepository.findOne({ where: { id } });

    if (!combo) {
      throw new NotFoundException(`Combo con id ${id} no encontrado`);
    }

    // Solo se soft-deletea el combo. Los ComboItems quedan intactos
    // porque TypeORM los excluye automáticamente al cargar el combo borrado.
    await this.comboRepository.softDelete(combo.id);
    void this.shopCacheService.invalidate();
  }

  // ─── PRIVATE ─────────────────────────────────────────────────────────────────

  private async findOne(id: number): Promise<ComboEntity> {
    const combo = await this.comboRepository.findOne({
      where: { id },
      relations: ['category', 'items', 'items.product'],
    });

    if (!combo) {
      throw new NotFoundException(`Combo con id ${id} no encontrado`);
    }

    return combo;
  }

  private async validateItems(
    items: { productId: number; quantity: number }[],
  ): Promise<void> {
    const ids = items.map((i) => i.productId);

    // Detecta duplicados en el array del DTO antes de ir a la DB.
    // Sin esto, un combo podría tener el mismo productId dos veces.
    const seen = new Set<number>();
    for (const id of ids) {
      if (seen.has(id)) {
        throw new BadRequestException(`Producto con id ${id} duplicado en el combo`);
      }
      seen.add(id);
    }

    // Verifica en un solo query que todos los productIds existen.
    // Compara el count de encontrados vs el count esperado para saber
    // cuál falta, sin hacer N queries individuales.
    const found = await this.productRepository.findBy({ id: In(ids) });

    if (found.length !== ids.length) {
      const foundIds = new Set(found.map((p) => p.id));
      const missing = ids.find((id) => !foundIds.has(id));
      throw new BadRequestException(`Producto con id ${missing} no encontrado`);
    }
  }

  private async validateCategoryExists(categoryId: number): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new BadRequestException(`Categoría con id ${categoryId} no encontrada`);
    }
  }
}
```
