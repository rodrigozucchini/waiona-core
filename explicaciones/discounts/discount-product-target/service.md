```ts
@Injectable()
export class DiscountProductTargetService {
  constructor(
    // Repositorio de la tabla de unión "discount_product_targets".
    // Nombre corto "repo" en vez de "discountProductTargetRepository": válido
    // cuando hay un solo repositorio principal y el contexto es claro.
    @InjectRepository(DiscountProductTargetEntity)
    private readonly repo: Repository<DiscountProductTargetEntity>,

    // Se inyecta el repositorio del descuento padre para validar que exista
    // antes de operar. Sin esto, se podría asignar un producto a un descuento
    // que no existe o fue borrado con soft delete.
    @InjectRepository(DiscountEntity)
    private readonly discountRepository: Repository<DiscountEntity>,
  ) {}

  // ─── CREATE ──────────────────────────────────────────────────────────────────

  async create(
    discountId: number,
    dto: CreateDiscountProductTargetDto,
  ): Promise<DiscountProductTargetResponseDto> {

    // 1. Valida que el descuento padre exista (404 si no).
    await this.findDiscount(discountId);

    // 2. Valida que esta combinación exacta (discountId + productId) no exista ya.
    //    Evita asignar el mismo producto dos veces al mismo descuento.
    await this.validateUniqueTarget(discountId, dto.productId);

    // 3. Valida que el producto no tenga YA un descuento activo de CUALQUIER otro descuento.
    //    Esta es una regla de negocio más amplia que la anterior: un producto
    //    solo puede estar en un descuento a la vez (en toda la tabla, no solo en este discountId).
    //    Esto evita descuentos solapados que confundirían al motor de cálculo de precios.
    await this.validateProductHasNoActiveDiscount(dto.productId);

    const entity = this.repo.create({
      discountId,
      productId: dto.productId,
    });

    const saved = await this.repo.save(entity);

    return new DiscountProductTargetResponseDto(saved);
    // No hay invalidación de caché aquí: el target en sí no cambia precios.
    // Los precios se recalculan cuando el motor los lee, no cuando se asigna el target.
  }

  // ─── GET ALL BY DISCOUNT ─────────────────────────────────────────────────────

  async findAll(
    discountId: number,
  ): Promise<DiscountProductTargetResponseDto[]> {
    // Se verifica que el discount padre exista antes de listar.
    // Si el discount fue borrado, devolver una lista vacía podría ser confuso;
    // mejor fallar con 404 para que el cliente sepa que el recurso padre no existe.
    await this.findDiscount(discountId);

    const targets = await this.repo.find({
      where: { discountId },
    });

    return targets.map((t) => new DiscountProductTargetResponseDto(t));
  }

  // ─── DELETE (soft) ───────────────────────────────────────────────────────────

  async remove(discountId: number, productId: number): Promise<void> {
    await this.findDiscount(discountId);

    // La búsqueda es por (discountId, productId), no por el id interno del registro.
    // La semántica del delete es "quitar este producto de este descuento",
    // no "borrar el registro con id X". Por eso el controller recibe productId en la URL.
    const entity = await this.repo.findOne({
      where: { discountId, productId },
    });

    if (!entity) {
      throw new NotFoundException(
        `Product target ${productId} not found for discount ${discountId}`,
      );
    }

    await this.repo.softDelete(entity.id);
    // No hay PATCH/update: las asignaciones de target son atómicas.
    // Se crean o se borran; no hay "actualizar qué producto tiene un descuento".
  }

  // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────

  private async findDiscount(discountId: number): Promise<DiscountEntity> {
    const discount = await this.discountRepository.findOne({
      where: { id: discountId },
    });

    if (!discount) {
      throw new NotFoundException(`Discount with id ${discountId} not found`);
    }

    return discount;
  }

  private async validateUniqueTarget(
    discountId: number,
    productId: number,
  ): Promise<void> {
    // Unicidad dentro del mismo descuento: este producto ya está asignado a este descuento.
    const existing = await this.repo.findOne({
      where: { discountId, productId },
    });

    if (existing) {
      throw new ConflictException(
        `Product ${productId} is already a target of discount ${discountId}`,
      );
    }
  }

  private async validateProductHasNoActiveDiscount(
    productId: number,
  ): Promise<void> {
    // Unicidad global: este producto ya está asignado a ALGÚN descuento (de cualquiera).
    // Busca solo por productId, sin filtrar por discountId.
    // Garantiza que un producto tenga como máximo un descuento activo en todo el sistema.
    const existing = await this.repo.findOne({
      where: { productId },
    });

    if (existing) {
      throw new ConflictException(
        `Product ${productId} already has an active discount assigned`,
      );
    }
  }
}
```
