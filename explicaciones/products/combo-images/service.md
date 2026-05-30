```ts
@Injectable()
export class ComboImageService {
  constructor(
    @InjectRepository(ComboImageEntity)
    private readonly comboImageRepository: Repository<ComboImageEntity>,

    // Se inyecta el repositorio de Combo para validar que el combo exista
    // antes de asociar una imagen. Sin esto, se podría crear una imagen
    // con un comboId que no existe.
    @InjectRepository(ComboEntity)
    private readonly comboRepository: Repository<ComboEntity>,

    // StorageService encapsula Cloudinary. Solo se usa en upload y remove.
    private readonly storageService: StorageService,

    private readonly shopCacheService: ShopCacheService,
  ) {}

  // ─── CREATE (URL externa) ─────────────────────────────────────────────────────

  async create(dto: CreateComboImageDto): Promise<ComboImageResponseDto> {
    const combo = await this.comboRepository.findOne({
      where: { id: dto.comboId },
    });

    if (!combo) {
      throw new NotFoundException(`Combo con id ${dto.comboId} no encontrado`);
    }

    const image = this.comboImageRepository.create(dto);
    const saved = await this.comboImageRepository.save(image);
    void this.shopCacheService.invalidate();
    return new ComboImageResponseDto(saved);
  }

  // ─── FIND BY COMBO ───────────────────────────────────────────────────────────

  async findByCombo(comboId: number): Promise<ComboImageResponseDto[]> {
    // Orden por position ASC: la imagen con menor position es la principal.
    const images = await this.comboImageRepository.find({
      where: { comboId },
      order: { position: 'ASC' },
    });

    return images.map((image) => new ComboImageResponseDto(image));
  }

  // ─── FIND ONE BY ID ───────────────────────────────────────────────────────────

  async findOne(id: number): Promise<ComboImageResponseDto> {
    return new ComboImageResponseDto(await this.findEntity(id));
  }

  // ─── UPDATE ──────────────────────────────────────────────────────────────────

  async update(
    id: number,
    dto: UpdateComboImageDto,
  ): Promise<ComboImageResponseDto> {
    const image = await this.findEntity(id);
    const merged = this.comboImageRepository.merge(image, dto);
    const updated = await this.comboImageRepository.save(merged);
    void this.shopCacheService.invalidate();
    return new ComboImageResponseDto(updated);
  }

  // ─── UPLOAD (multipart → Cloudinary) ─────────────────────────────────────────

  async uploadImage(
    file: Express.Multer.File,
    dto: UploadComboImageDto,
  ): Promise<ComboImageResponseDto> {
    const combo = await this.comboRepository.findOne({
      where: { id: dto.comboId },
    });
    if (!combo) {
      throw new NotFoundException(`Combo con id ${dto.comboId} no encontrado`);
    }

    // El folder 'waiona/combos' separa los assets de combos de los de productos
    // dentro de Cloudinary, facilitando la gestión desde el panel de Cloudinary.
    const { url, publicId } = await this.storageService.upload(
      file,
      'waiona/combos',
    );

    const image = this.comboImageRepository.create({
      comboId: dto.comboId,
      position: dto.position,
      url,
      publicId, // Guardado en DB para poder eliminar el asset en Cloudinary al borrar la imagen.
    });
    const saved = await this.comboImageRepository.save(image);
    void this.shopCacheService.invalidate();
    return new ComboImageResponseDto(saved);
  }

  // ─── DELETE (soft + Cloudinary) ───────────────────────────────────────────────

  async remove(id: number): Promise<void> {
    const image = await this.findEntity(id);

    // Solo llama a Cloudinary si la imagen fue subida por upload.
    // Si es URL externa (publicId null), solo se soft-deletea en DB.
    if (image.publicId) {
      await this.storageService.delete(image.publicId);
    }

    await this.comboImageRepository.softDelete(image.id);
    void this.shopCacheService.invalidate();
  }

  // ─── PRIVATE ─────────────────────────────────────────────────────────────────

  private async findEntity(id: number): Promise<ComboImageEntity> {
    const image = await this.comboImageRepository.findOne({ where: { id } });
    if (!image)
      throw new NotFoundException(`Imagen de combo con id ${id} no encontrada`);
    return image;
  }
}
```
