```ts
@ApiTags('Combo Taxes')
@ApiBearerAuth()
// @ApiParam a nivel de clase documenta el segmento :comboId en Swagger para
// todos los endpoints del controller.
@ApiParam({ name: 'comboId', type: Number })
@Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
// Ruta anidada: combos/:comboId/taxes
// Espeja la misma estructura que products/:productId/taxes pero para combos.
@Controller({ version: '1', path: 'combos/:comboId/taxes' })
export class ComboTaxesController {
  constructor(private readonly comboTaxesService: ComboTaxesService) {}

  // GET /v1/combos/:comboId/taxes
  @ApiOperation({ summary: 'List taxes for a combo' })
  @ApiResponse({ status: 200, type: [ComboTaxResponseDto] })
  @Get()
  findAll(
    @Param('comboId', ParseIntPipe) comboId: number,
  ): Promise<ComboTaxResponseDto[]> {
    return this.comboTaxesService.findAll(comboId);
  }

  // GET /v1/combos/:comboId/taxes/:id
  @ApiOperation({ summary: 'Get a combo tax by ID' })
  @ApiResponse({ status: 200, type: ComboTaxResponseDto })
  @ApiResponse({ status: 404, description: 'Not found' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ComboTaxResponseDto> {
    // comboId no se pasa: findOne solo necesita el id del registro de combo_tax.
    return this.comboTaxesService.findOne(id);
  }

  // POST /v1/combos/:comboId/taxes
  @ApiOperation({ summary: 'Assign a tax to a combo' })
  @ApiResponse({ status: 201, type: ComboTaxResponseDto })
  @ApiResponse({ status: 400, description: 'Tax not found or is global' })
  @Post()
  create(
    @Param('comboId', ParseIntPipe) comboId: number,
    @Body() dto: CreateComboTaxDto,
  ): Promise<ComboTaxResponseDto> {
    // Mismo patrón de spread que en ProductTaxesController:
    // fusiona el body DTO con el comboId del URL en un único objeto para el servicio.
    return this.comboTaxesService.create({ ...dto, comboId });
  }

  // PATCH /v1/combos/:comboId/taxes/:id
  @ApiOperation({ summary: 'Update a combo tax assignment' })
  @ApiResponse({ status: 200, type: ComboTaxResponseDto })
  @ApiResponse({ status: 404, description: 'Not found' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateComboTaxDto,
  ): Promise<ComboTaxResponseDto> {
    return this.comboTaxesService.update(id, dto);
  }

  // DELETE /v1/combos/:comboId/taxes/:id
  @ApiOperation({ summary: 'Remove a tax from a combo' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.comboTaxesService.remove(id);
  }
}
```
