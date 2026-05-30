```ts
@ApiTags('Shop')
// Sin @ApiBearerAuth ni @UseGuards: el shop es público.
// Cualquier cliente (incluso sin cuenta) puede ver el catálogo y los precios.
@Controller({ version: '1', path: 'shop' })
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  // GET /v1/shop/items
  // Busca y lista productos y combos del catálogo.
  // Parámetros opcionales de búsqueda: search, type, categoryId, minPrice, maxPrice, page, limit.
  @Get('items')
  @ApiOperation({ summary: 'Buscar productos y combos del catálogo público' })
  @ApiResponse({
    status: 200,
    description: 'Resultados paginados del catálogo',
    type: ShopPaginatedResponseDto,
  })
  async search(
    @Query() query: SearchShopDto,
    // Se usa @Query() con SearchShopDto (no PaginationQueryDto) porque el shop
    // tiene parámetros adicionales específicos: search, type, categoryId, minPrice, maxPrice.
  ): Promise<ShopPaginatedResponseDto> {
    return this.shopService.search(query);
  }

  // GET /v1/shop/items/:id?type=product|combo
  // Devuelve el detalle completo de un producto o combo: precio breakdown,
  // todas las imágenes, stock real y (en combos) lista de items.
  // El parámetro "type" es obligatorio para que el servicio sepa en qué tabla buscar.
  @Get('items/:id')
  @ApiOperation({ summary: 'Obtener detalle de un producto o combo' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'type', enum: ['product', 'combo'], required: true })
  @ApiResponse({
    status: 200,
    description: 'Detalle del ítem con precio y stock',
    type: ShopDetailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetro type requerido (product | combo)',
  })
  @ApiResponse({
    status: 404,
    description: 'Ítem no encontrado o sin precio configurado',
  })
  async findById(
    @Param('id', ParseIntPipe) id: number,
    // type como @Query() string en vez de venir en el body:
    // semánticamente es un filtro de la URL, no datos de la entidad.
    @Query('type') type: 'product' | 'combo',
  ): Promise<ShopDetailResponseDto> {
    return this.shopService.findById(id, type);
  }
}
```
