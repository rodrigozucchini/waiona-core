```ts
@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(DiscountEntity)
    private readonly discountRepository: Repository<DiscountEntity>,

    // Invalida la caché del shop cuando cambia un descuento, porque los descuentos
    // afectan el precio que ve el cliente.
    private readonly shopCacheService: ShopCacheService,
  ) {}

  // ─── CREATE ──────────────────────────────────────────────────────────────────

  async create(dto: CreateDiscountDto): Promise<DiscountResponseDto> {
    // Las validaciones se ejecutan en este orden deliberado:
    // 1. Fechas (independiente del tipo de descuento)
    // 2. Normalización (limpia los datos antes de validar el valor)
    // 3. Valor (trabaja con datos ya normalizados)
    this.validateDates(dto.startsAt, dto.endsAt);

    // normalizeDiscount prepara los campos que interactúan entre sí
    // (value, isPercentage, currency) antes de validarlos.
    // Si isPercentage es true, fuerza currency a null aquí para que
    // validateValue y el save() siempre reciban datos consistentes.
    const normalized = this.normalizeDiscount({
      value: dto.value,
      isPercentage: dto.isPercentage,
      currency: dto.currency,
    });

    // Valida el valor sobre los datos ya normalizados, no sobre el DTO crudo.
    this.validateValue(
      normalized.value,
      normalized.isPercentage,
      normalized.currency,
    );

    const discount = this.discountRepository.create({
      name: dto.name,
      description: dto.description,
      startsAt: dto.startsAt,
      endsAt: dto.endsAt,
      value: normalized.value,
      isPercentage: normalized.isPercentage,
      // ?? null: si currency llegó como undefined (no enviada), se guarda null explícito.
      // La entidad declara currency como nullable, así que null es el valor correcto en DB.
      currency: normalized.currency ?? null,
    });

    const saved = await this.discountRepository.save(discount);
    void this.shopCacheService.invalidate(); // Fire-and-forget.
    return new DiscountResponseDto(saved);
  }

  // ─── GET ALL ─────────────────────────────────────────────────────────────────

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponseDto<DiscountResponseDto>> {
    const [discounts, total] = await this.discountRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      // TypeORM agrega WHERE deletedAt IS NULL automáticamente por @DeleteDateColumn.
    });

    return new PaginatedResponseDto(
      discounts.map((discount) => new DiscountResponseDto(discount)),
      total,
      page,
      limit,
    );
  }

  // ─── GET ONE ─────────────────────────────────────────────────────────────────

  async findOne(id: number): Promise<DiscountResponseDto> {
    const discount = await this.findEntity(id);
    return new DiscountResponseDto(discount);
  }

  // ─── UPDATE ──────────────────────────────────────────────────────────────────

  async update(
    id: number,
    dto: UpdateDiscountDto,
  ): Promise<DiscountResponseDto> {
    const discount = await this.findEntity(id);

    // Se reconstruye el estado final campo a campo usando ?? para combinar
    // el valor del DTO (si viene) con el valor actual de la entidad (fallback).
    // NO se usa .merge() ni spread del dto aquí, deliberadamente: el merge/spread
    // pisaría campos con undefined cuando el DTO parcial no los envía, lo que
    // podría romper la entidad o limpiar datos que deberían mantenerse.
    const value = Number(dto.value ?? discount.value); // Number(): casteo defensivo, TypeORM puede retornar decimal como string.
    const isPercentage = dto.isPercentage ?? discount.isPercentage;
    const currency = dto.currency ?? discount.currency;

    const startsAt = dto.startsAt ?? discount.startsAt;
    const endsAt = dto.endsAt ?? discount.endsAt;

    // Se validan fechas y valor sobre el estado efectivo final, no sobre el DTO parcial.
    this.validateDates(startsAt, endsAt);

    const normalized = this.normalizeDiscount({ value, isPercentage, currency });

    this.validateValue(
      normalized.value,
      normalized.isPercentage,
      normalized.currency,
    );

    // Asignación campo a campo directa sobre la entidad ya cargada.
    // Es equivalente a merge() pero más explícito sobre qué campos se tocan.
    discount.name = dto.name ?? discount.name;
    discount.description = dto.description ?? discount.description;
    discount.value = normalized.value;
    discount.isPercentage = normalized.isPercentage;
    discount.currency = normalized.currency ?? null;
    discount.startsAt = startsAt ?? null;
    discount.endsAt = endsAt ?? null;

    const updated = await this.discountRepository.save(discount);
    void this.shopCacheService.invalidate();
    return new DiscountResponseDto(updated);
  }

  // ─── DELETE (soft) ───────────────────────────────────────────────────────────

  async remove(id: number): Promise<void> {
    const discount = await this.findEntity(id);
    await this.discountRepository.softDelete(discount.id);
    void this.shopCacheService.invalidate();
  }

  // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────

  private async findEntity(id: number): Promise<DiscountEntity> {
    const discount = await this.discountRepository.findOne({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException(`Discount with id ${id} not found`);
    }

    return discount;
  }

  private validateDates(startsAt?: Date | null, endsAt?: Date | null): void {
    if (startsAt && endsAt) {
      // >= en lugar de > para rechazar el caso startsAt === endsAt,
      // que crearía un rango vacío (ningún momento del tiempo pertenecería al descuento).
      if (new Date(startsAt) >= new Date(endsAt)) {
        throw new BadRequestException('startsAt must be before endsAt');
      }
    }
    // Si alguna de las dos es null/undefined, no se valida: ambas son opcionales.
    // Un descuento sin fechas es válido (aplica siempre hasta que se borre).
  }

  private validateValue(
    value: number,
    isPercentage: boolean,
    currency?: CurrencyCode | null,
  ): void {
    if (isPercentage) {
      // Un porcentaje de descuento mayor a 100 no tiene sentido (precio negativo).
      if (value > 100) {
        throw new BadRequestException('Percentage discount cannot exceed 100');
      }
    } else {
      // Un descuento de monto fijo necesita saber en qué moneda está expresado.
      // Sin currency, el motor de cálculo de precios no puede aplicarlo.
      if (!currency) {
        throw new BadRequestException(
          'Fixed amount discount requires a currency',
        );
      }
    }
  }

  private normalizeDiscount({
    value,
    isPercentage,
    currency,
  }: {
    value: number;
    isPercentage: boolean;
    currency?: CurrencyCode | null;
  }) {
    return {
      value,
      isPercentage,
      // Si el descuento es de tipo porcentaje, se fuerza currency a null
      // independientemente de lo que haya llegado en el DTO.
      // Esto evita que quede un dato huérfano en la DB (currency guardada pero ignorada).
      currency: isPercentage ? null : currency,
    };
  }
}
```
