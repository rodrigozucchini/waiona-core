```ts
@ApiTags('Discounts')
@ApiBearerAuth()
@Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ version: '1', path: 'discounts' })
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  // POST /v1/discounts
  @Post()
  @ApiOperation({ summary: 'Crear un descuento' })
  @ApiResponse({ status: 201, type: DiscountResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  // Los métodos son async explícitamente aquí, a diferencia de otros controllers
  // del proyecto que devuelven la Promise directamente sin async/await.
  // Ambas formas son funcionalmente equivalentes en NestJS: la Promise se resuelve igual.
  async create(@Body() dto: CreateDiscountDto): Promise<DiscountResponseDto> {
    return this.discountsService.create(dto);
  }

  // GET /v1/discounts
  @Get()
  @ApiOperation({ summary: 'Listar descuentos paginados' })
  @ApiResponse({ status: 200, type: DiscountResponseDto, isArray: true })
  async findAll(
    @Query() { page, limit }: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<DiscountResponseDto>> {
    return this.discountsService.findAll(page, limit);
  }

  // GET /v1/discounts/:id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener descuento por ID' })
  // @ApiParam por método en vez de a nivel de clase: a diferencia de los controllers
  // de rutas anidadas (taxes, product-taxes), aquí el :id solo aplica a algunos
  // endpoints, por eso tiene más sentido documentarlo método a método.
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: DiscountResponseDto })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DiscountResponseDto> {
    return this.discountsService.findOne(id);
  }

  // PATCH /v1/discounts/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar descuento (parcial)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: DiscountResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiscountDto,
  ): Promise<DiscountResponseDto> {
    return this.discountsService.update(id, dto);
  }

  // DELETE /v1/discounts/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Sobreescribe el 200 por defecto a 204 sin body.
  @ApiOperation({ summary: 'Eliminar descuento (soft delete)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Eliminado' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.discountsService.remove(id);
  }
}
```
