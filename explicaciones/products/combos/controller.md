```ts
@ApiTags('Combos')
@ApiBearerAuth()
// Solo admins gestionan combos. Los clientes los ven a través del shop.
@Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ version: '1', path: 'combos' })
export class ComboController {
  constructor(private readonly comboService: ComboService) {}

  // GET /v1/combos
  @Get()
  @ApiOperation({ summary: 'Listar combos paginados' })
  @ApiResponse({ status: 200, type: ComboResponseDto, isArray: true })
  async findAll(
    @Query() { page, limit }: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ComboResponseDto>> {
    return this.comboService.findAll(page, limit);
  }

  // GET /v1/combos/:id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener combo por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ComboResponseDto })
  @ApiResponse({ status: 404, description: 'Combo no encontrado' })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ComboResponseDto> {
    return this.comboService.findById(id);
  }

  // POST /v1/combos
  @Post()
  @ApiOperation({ summary: 'Crear combo con items' })
  @ApiResponse({ status: 201, type: ComboResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos, categoría o producto no encontrado',
  })
  async create(@Body() body: CreateComboDto): Promise<ComboResponseDto> {
    return this.comboService.create(body);
  }

  // PATCH /v1/combos/:id
  // Si se envía el campo "items", reemplaza todos los items del combo.
  // Si no se envía, los items actuales no se tocan.
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar combo (parcial)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ComboResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Combo no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateComboDto,
  ): Promise<ComboResponseDto> {
    return this.comboService.update(id, body);
  }

  // DELETE /v1/combos/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar combo (soft delete)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Combo eliminado' })
  @ApiResponse({ status: 404, description: 'Combo no encontrado' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.comboService.delete(id);
  }
}
```
