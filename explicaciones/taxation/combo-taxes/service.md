```ts
@Injectable()
export class ComboTaxesService {
  constructor(
    // Repositorio de la tabla "combo_taxes": tabla de unión entre combos y taxes.
    @InjectRepository(ComboTaxEntity)
    private readonly comboTaxRepository: Repository<ComboTaxEntity>,

    // Se inyecta el repositorio de Tax para validar existencia e isGlobal
    // antes de asignar el impuesto al combo. Misma lógica que en ProductTaxesService.
    @InjectRepository(TaxEntity)
    private readonly taxRepository: Repository<TaxEntity>,
  ) {}

  // ─── CREATE ──────────────────────────────────────────────────────────────────

  async create(
    // comboId viene del URL (el controller hace el spread { ...dto, comboId }).
    // taxId viene del body (CreateComboTaxDto).
    dto: CreateComboTaxDto & { comboId: number },
  ): Promise<ComboTaxResponseDto> {

    // Valida que el tax exista antes de crear la asignación.
    const tax = await this.taxRepository.findOne({
      where: { id: dto.taxId },
    });

    if (!tax) {
      throw new NotFoundException(`Tax with id ${dto.taxId} not found`);
    }

    // Misma regla de negocio que en ProductTaxesService:
    // los taxes globales ya se aplican a todos los combos automáticamente,
    // así que asignarlos manualmente sería redundante e inconsistente.
    if (tax.isGlobal) {
      throw new BadRequestException(
        'A global tax cannot be assigned to a specific combo',
      );
    }

    const comboTax = this.comboTaxRepository.create({
      comboId: dto.comboId,
      taxId: dto.taxId,
    });

    const saved = await this.comboTaxRepository.save(comboTax);
    return new ComboTaxResponseDto(saved);
  }

  // ─── GET ALL BY COMBO ────────────────────────────────────────────────────────

  async findAll(comboId: number): Promise<ComboTaxResponseDto[]> {
    const comboTaxes = await this.comboTaxRepository.find({
      where: { comboId },
      order: { createdAt: 'DESC' },
    });

    return comboTaxes.map((ct) => new ComboTaxResponseDto(ct));
  }

  // ─── GET BY ID ───────────────────────────────────────────────────────────────

  async findOne(id: number): Promise<ComboTaxResponseDto> {
    return new ComboTaxResponseDto(await this.findEntity(id));
  }

  // ─── UPDATE ──────────────────────────────────────────────────────────────────

  async update(
    id: number,
    dto: UpdateComboTaxDto,
  ): Promise<ComboTaxResponseDto> {
    const comboTax = await this.findEntity(id);
    const merged = this.comboTaxRepository.merge(comboTax, dto);
    const updated = await this.comboTaxRepository.save(merged);
    return new ComboTaxResponseDto(updated);
  }

  // ─── SOFT DELETE ─────────────────────────────────────────────────────────────

  async remove(id: number): Promise<void> {
    const comboTax = await this.findEntity(id);
    await this.comboTaxRepository.softDelete(comboTax.id);
  }

  // ─── PRIVATE ─────────────────────────────────────────────────────────────────

  private async findEntity(id: number): Promise<ComboTaxEntity> {
    const entity = await this.comboTaxRepository.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`ComboTax with id ${id} not found`);
    return entity;
  }
}
```
