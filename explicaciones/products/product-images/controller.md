```ts
// Constantes de validación de archivo declaradas a nivel de módulo
// para compartirlas entre el fileFilter y los decoradores de Swagger.
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@ApiTags('Product Images')
@ApiBearerAuth()
@Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ version: '1', path: 'product-images' })
export class ProductImageController {
  constructor(private readonly productImageService: ProductImageService) {}

  // POST /v1/product-images/upload  (multipart/form-data)
  // IMPORTANTE: esta ruta debe ir ANTES de POST / para que NestJS no confunda
  // el segmento "upload" con el body de la ruta base.
  @Post('upload')
  @ApiOperation({ summary: 'Subir imagen de producto a Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'productId', 'position'],
      properties: {
        file: { type: 'string', format: 'binary' },
        productId: { type: 'integer' },
        position: { type: 'integer' },
      },
    },
  })
  @ApiResponse({ status: 201, type: ProductImageResponseDto })
  @ApiResponse({ status: 400, description: 'Archivo inválido o datos faltantes' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  // FileInterceptor intercepta el campo "file" del multipart. memoryStorage()
  // guarda el archivo en memoria (Buffer) en vez de en disco, adecuado para
  // archivos pequeños que se reenvían inmediatamente a Cloudinary.
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        // fileFilter se ejecuta antes de parsear el body completo.
        // Si el tipo MIME no está en la lista, rechaza el archivo con 400
        // sin llegar al handler.
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException('Solo se permiten imágenes (jpeg, png, webp, gif)'),
            false,
          );
        }
      },
    }),
  )
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadProductImageDto,
  ): Promise<ProductImageResponseDto> {
    // Guarda adicional: si el interceptor pasó pero el archivo quedó undefined
    // (e.g., campo "file" ausente en el form), se falla con 400 explícito.
    if (!file) throw new BadRequestException('El archivo es requerido');
    return this.productImageService.uploadImage(file, dto);
  }

  // POST /v1/product-images  (URL externa, sin subir archivo)
  @Post()
  @ApiOperation({ summary: 'Agregar imagen a un producto (URL externa)' })
  @ApiResponse({ status: 201, type: ProductImageResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  create(@Body() dto: CreateProductImageDto): Promise<ProductImageResponseDto> {
    return this.productImageService.create(dto);
  }

  // GET /v1/product-images/product/:productId
  // Ruta específica antes de GET :id para evitar que "product" sea interpretado
  // como un :id numérico (ParseIntPipe fallaría).
  @Get('product/:productId')
  @ApiOperation({ summary: 'Listar imágenes de un producto' })
  @ApiParam({ name: 'productId', type: Number })
  @ApiResponse({ status: 200, type: ProductImageResponseDto, isArray: true })
  findByProduct(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<ProductImageResponseDto[]> {
    return this.productImageService.findByProduct(productId);
  }

  // GET /v1/product-images/:id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener imagen por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ProductImageResponseDto })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductImageResponseDto> {
    return this.productImageService.findOne(id);
  }

  // PATCH /v1/product-images/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar imagen (parcial)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ProductImageResponseDto })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductImageDto,
  ): Promise<ProductImageResponseDto> {
    return this.productImageService.update(id, dto);
  }

  // DELETE /v1/product-images/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar imagen (soft delete)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Imagen eliminada' })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productImageService.remove(id);
  }
}
```
