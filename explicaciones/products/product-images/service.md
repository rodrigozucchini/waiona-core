```ts
@Injectable()
export class ProductImageService {
  constructor(
    @InjectRepository(ProductImageEntity)
    private readonly productImageRepository: Repository<ProductImageEntity>,

    // Se inyecta el repositorio de Product para validar que el producto exista
    // antes de asociar una imagen. Sin esto, se podría registrar una imagen
    // con un productId inválido.
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    // StorageService encapsula la lógica de Cloudinary (upload + delete).
    // Se usa solo en los métodos que manejan archivos físicos; los métodos
    // de URL externa no lo necesitan.
    private readonly storageService: StorageService,

    private readonly shopCacheService: ShopCacheService,
  ) {}

  // ─── CREATE (URL externa) ─────────────────────────────────────────────────────

  async create(dto: CreateProductImageDto): Promise<ProductImageResponseDto> {
    // Validación del producto antes de insertar.
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Producto con id ${dto.productId} no encontrado`);
    }

    const image = this.productImageRepository.create(dto);
    const saved = await this.productImageRepository.save(image);
    void this.shopCacheService.invalidate();
    return new ProductImageResponseDto(saved);
  }

  // ─── FIND BY PRODUCT ─────────────────────────────────────────────────────────

  async findByProduct(productId: number): Promise<ProductImageResponseDto[]> {
    // Ordena por position ASC: el front muestra las imágenes en ese orden.
    // Position 0 o el menor valor es la imagen principal (thumbnail).
    const images = await this.productImageRepository.find({
      where: { productId },
      order: { position: 'ASC' },
    });

    return images.map((image) => new ProductImageResponseDto(image));
  }

  // ─── FIND ONE BY ID ───────────────────────────────────────────────────────────

  async findOne(id: number): Promise<ProductImageResponseDto> {
    return new ProductImageResponseDto(await this.findEntity(id));
  }

  // ─── UPDATE ──────────────────────────────────────────────────────────────────

  async update(
    id: number,
    dto: UpdateProductImageDto,
  ): Promise<ProductImageResponseDto> {
    const image = await this.findEntity(id);
    const merged = this.productImageRepository.merge(image, dto);
    const updated = await this.productImageRepository.save(merged);
    void this.shopCacheService.invalidate();
    return new ProductImageResponseDto(updated);
  }

  // ─── UPLOAD (multipart → Cloudinary) ─────────────────────────────────────────

  async uploadImage(
    file: Express.Multer.File,
    dto: UploadProductImageDto,
  ): Promise<ProductImageResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException(`Producto con id ${dto.productId} no encontrado`);
    }

    // StorageService sube el archivo a Cloudinary y devuelve la URL pública
    // y el publicId (necesario para poder borrarlo después).
    // El folder 'waiona/products' organiza los assets en Cloudinary por tipo.
    const { url, publicId } = await this.storageService.upload(
      file,
      'waiona/products',
    );

    const image = this.productImageRepository.create({
      productId: dto.productId,
      position: dto.position,
      url,
      publicId, // Se guarda en DB para poder hacer delete en Cloudinary al borrar la imagen.
    });
    const saved = await this.productImageRepository.save(image);
    void this.shopCacheService.invalidate();
    return new ProductImageResponseDto(saved);
  }

  // ─── DELETE (soft + Cloudinary) ───────────────────────────────────────────────

  async remove(id: number): Promise<void> {
    const image = await this.findEntity(id);

    // Si la imagen fue subida a Cloudinary, se borra también del storage externo.
    // Si es URL externa (publicId null), solo se soft-deletea en la DB.
    if (image.publicId) {
      await this.storageService.delete(image.publicId);
    }

    await this.productImageRepository.softDelete(image.id);
    void this.shopCacheService.invalidate();
  }

  // ─── PRIVATE ─────────────────────────────────────────────────────────────────

  private async findEntity(id: number): Promise<ProductImageEntity> {
    const image = await this.productImageRepository.findOne({ where: { id } });
    if (!image)
      throw new NotFoundException(`Imagen de producto con id ${id} no encontrada`);
    return image;
  }
}
```
