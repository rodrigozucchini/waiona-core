```ts
@ApiTags('Products')
@ApiBearerAuth()
// Solo admins gestionan el catálogo. El cliente accede a los productos
// a través del shop (/v1/shop/items), que es el endpoint público.
@Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ version: '1', path: 'products' })
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // GET /v1/products
  @Get()
  @ApiOperation({ summary: 'Listar productos paginados' })
  @ApiResponse({ status: 200, type: ProductResponseDto, isArray: true })
  async findAll(
    @Query() { page, limit }: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ProductResponseDto>> {
    return this.productService.findAll(page, limit);
  }

  // GET /v1/products/:id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductResponseDto> {
    return this.productService.findById(id);
  }

  // POST /v1/products
  @Post()
  @ApiOperation({ summary: 'Crear producto' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o categoría no encontrada',
  })
  @ApiResponse({ status: 409, description: 'SKU ya existe' })
  async create(@Body() body: CreateProductDto): Promise<ProductResponseDto> {
    return this.productService.create(body);
  }

  // PATCH /v1/products/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar producto (parcial)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.update(id, body);
  }

  // DELETE /v1/products/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar producto (soft delete)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Producto eliminado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productService.delete(id);
  }
}
```
