```ts
@ApiTags('Categories')
@ApiBearerAuth()
// Todos los endpoints requieren admin: el catálogo de categorías es gestión interna.
// El cliente las ve a través del shop (endpoint público separado).
@Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ version: '1', path: 'categories' })
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // GET /v1/categories
  @Get()
  @ApiOperation({ summary: 'Listar categorías paginadas' })
  @ApiResponse({ status: 200, type: CategoryResponseDto, isArray: true })
  async findAll(@Query() { page, limit }: PaginationQueryDto) {
    return this.categoryService.findAll(page, limit);
  }

  // GET /v1/categories/tree
  // IMPORTANTE: esta ruta debe ir ANTES de GET :id para que NestJS no interprete
  // "tree" como un :id numérico. ParseIntPipe fallaría si llegara primero.
  @Get('tree')
  @ApiOperation({ summary: 'Obtener árbol de categorías (jerarquía completa)' })
  @ApiResponse({ status: 200, type: CategoryTreeResponseDto, isArray: true })
  async getTree(): Promise<CategoryTreeResponseDto[]> {
    return this.categoryService.getTree();
  }

  // GET /v1/categories/:id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener categoría por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.findById(id);
  }

  // POST /v1/categories
  @Post()
  @ApiOperation({ summary: 'Crear categoría' })
  @ApiResponse({ status: 201, type: CategoryResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o categoría padre no encontrada',
  })
  async create(@Body() body: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoryService.create(body);
  }

  // PATCH /v1/categories/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar categoría (parcial)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o jerarquía circular detectada',
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.update(id, body);
  }

  // DELETE /v1/categories/:id
  @Delete(':id')
  // @HttpCode sobreescribe el 200 por defecto a 204: delete exitoso sin body de respuesta.
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar categoría (soft delete)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Categoría eliminada' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @ApiResponse({
    status: 409,
    description: 'Categoría tiene productos o combos activos asignados',
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.categoryService.delete(id);
  }
}
```
