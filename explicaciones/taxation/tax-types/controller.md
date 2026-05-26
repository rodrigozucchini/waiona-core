```ts
@ApiTags('Tax Types')
@ApiBearerAuth()
@Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
// Ruta plana (no anidada): /v1/tax-types
// TaxType es una entidad de primer nivel, no pertenece a ningún padre en la URL.
@Controller({ version: '1', path: 'tax-types' })
export class TaxTypesController {
  // Nótese que aquí no es "private readonly" como en otros controllers del proyecto.
  // Es un detalle de estilo menor — funcionalmente es equivalente.
  constructor(private taxTypesService: TaxTypesService) {}

  // GET /v1/tax-types
  @ApiOperation({ summary: 'List tax types (paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated list of tax types' })
  @Get()
  // Nombre del método: getTaxTypes en vez del convencional findAll.
  // No hay una convención única forzada en NestJS; ambas son válidas.
  getTaxTypes(@Query() { page, limit }: PaginationQueryDto) {
    // @Query() extrae los query params del URL (?page=1&limit=20).
    // PaginationQueryDto los transforma a number y aplica defaults vía ValidationPipe.
    return this.taxTypesService.findAll(page, limit);
  }

  // GET /v1/tax-types/:id
  @ApiOperation({ summary: 'Get a tax type by ID' })
  @ApiResponse({ status: 200, type: TaxTypeResponseDto })
  @ApiResponse({ status: 404, description: 'Not found' })
  @Get(':id')
  findTaxType(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TaxTypeResponseDto> {
    return this.taxTypesService.findById(id);
  }

  // POST /v1/tax-types
  @ApiOperation({ summary: 'Create a tax type' })
  @ApiResponse({ status: 201, type: TaxTypeResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Duplicate code or validation error',
  })
  @Post()
  createTaxType(@Body() body: CreateTaxTypeDto): Promise<TaxTypeResponseDto> {
    // Parámetro nombrado "body" en vez del convencional "dto".
    // Funcionalmente idéntico — es solo preferencia de estilo.
    return this.taxTypesService.create(body);
  }

  // PATCH /v1/tax-types/:id
  @ApiOperation({ summary: 'Update a tax type' })
  @ApiResponse({ status: 200, type: TaxTypeResponseDto })
  @ApiResponse({ status: 404, description: 'Not found' })
  @Patch(':id')
  updateTaxType(
    @Param('id', ParseIntPipe) id: number,
    @Body() changes: UpdateTaxTypeDto,
  ): Promise<TaxTypeResponseDto> {
    // Parámetro nombrado "changes" para comunicar que es una actualización
    // parcial (UpdateTaxTypeDto extiende PartialType). Más descriptivo que "dto".
    return this.taxTypesService.update(id, changes);
  }

  // DELETE /v1/tax-types/:id
  @ApiOperation({ summary: 'Delete a tax type' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Sobreescribe el 200 por defecto a 204 sin body.
  deleteTaxType(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.taxTypesService.delete(id);
  }
}
```
