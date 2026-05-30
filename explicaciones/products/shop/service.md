```ts
const PRICE_FILTER_SCAN_LIMIT = 500;
// Límite de candidatos que se calculan cuando hay filtro de precio.
// El filtro de precio requiere calcular el precio de TODOS los items para saber
// cuáles pasan el rango, lo cual hace N llamadas a CalculationService.
// Este cap evita que una búsqueda sin type ni search calcule miles de items.

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    @InjectRepository(ComboEntity)
    private readonly comboRepository: Repository<ComboEntity>,

    // CalculationService aplica margen, descuentos e impuestos sobre el precio base.
    // Se usa para calcular finalPrice, fullPrice y el breakdown de cada item.
    private readonly calculationService: CalculationService,

    // StockItemsService devuelve la cantidad disponible para productos y combos.
    // Los combos calculan su stock como el mínimo entre los stocks de sus productos.
    private readonly stockItemsService: StockItemsService,

    // ShopCacheService cachea los resultados de search y detail en Redis.
    // Las queries del shop son costosas (N cálculos de precio + N consultas de stock),
    // por lo que el cache es clave para la performance del catálogo público.
    private readonly shopCacheService: ShopCacheService,
  ) {}

  // ─── SEARCH (listado) ─────────────────────────────────────────────────────────

  async search(dto: SearchShopDto): Promise<ShopPaginatedResponseDto> {
    // Cache por combinación de parámetros: si la misma búsqueda se repite,
    // se devuelve el resultado cacheado sin ir a la DB ni calcular precios.
    const cacheKey = `search:${JSON.stringify(dto)}`;
    const cached = await this.shopCacheService.get<ShopPaginatedResponseDto>(cacheKey);
    if (cached) return cached;

    const { search, type, page = 1, limit = 20, minPrice, maxPrice, categoryId } = dto;

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      throw new BadRequestException('minPrice no puede ser mayor que maxPrice');
    }

    const skip = (page - 1) * limit;
    const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined;

    type Candidate =
      | { kind: 'product'; entity: ProductEntity }
      | { kind: 'combo'; entity: ComboEntity };

    const candidates: Candidate[] = [];

    // Se cargan productos y combos por separado según el filtro "type".
    // Solo se traen los isActive: true para no exponer items deshabilitados.
    // Solo se cargan imágenes (no precios ni stock) en este punto.
    if (!type || type === 'product') {
      const where: any = { isActive: true };
      if (search) where.name = ILike(`%${search}%`);
      if (categoryId) where.categoryId = categoryId;
      const products = await this.productRepository.find({
        where,
        relations: ['images'],
        order: { name: 'ASC' },
      });
      candidates.push(...products.map((entity) => ({ kind: 'product' as const, entity })));
    }

    if (!type || type === 'combo') {
      const where: any = { isActive: true };
      if (search) where.name = ILike(`%${search}%`);
      if (categoryId) where.categoryId = categoryId;
      const combos = await this.comboRepository.find({
        where,
        relations: ['images'],
        order: { name: 'ASC' },
      });
      candidates.push(...combos.map((entity) => ({ kind: 'combo' as const, entity })));
    }

    // Re-sort global para mezclar productos y combos en orden alfabético.
    // Cada query individual ya viene ordenada, pero la mezcla rompe ese orden.
    candidates.sort((a, b) => a.entity.name.localeCompare(b.entity.name));

    // Cap de candidatos cuando hay filtro de precio para evitar N cálculos masivos.
    if (hasPriceFilter && candidates.length > PRICE_FILTER_SCAN_LIMIT) {
      candidates.length = PRICE_FILTER_SCAN_LIMIT;
    }

    let result: ShopPaginatedResponseDto;

    if (!hasPriceFilter) {
      // Sin filtro de precio: se pagina primero y se calculan solo los items de la página.
      // Mucho más eficiente: si hay 1000 candidatos y limit=20, solo se calculan 20.
      const total = candidates.length;
      const totalPages = Math.ceil(total / limit);
      const page_slice = candidates.slice(skip, skip + limit);

      const data = (
        await Promise.all(
          page_slice.map((c) =>
            c.kind === 'product'
              ? this.buildProductListItem(c.entity, undefined, undefined)
              : this.buildComboListItem(c.entity, undefined, undefined),
          ),
        )
      ).filter((i): i is ShopItemResponseDto => i !== null);
      // filter(i => i !== null): los items sin precio configurado se excluyen silenciosamente.

      result = { total, page, limit, totalPages, hasNextPage: page < totalPages, data };
    } else {
      // Con filtro de precio: hay que calcular todos los candidatos para saber
      // cuáles pasan el rango, y recién después paginar.
      const allItems = (
        await Promise.all(
          candidates.map((c) =>
            c.kind === 'product'
              ? this.buildProductListItem(c.entity, minPrice, maxPrice)
              : this.buildComboListItem(c.entity, minPrice, maxPrice),
          ),
        )
      ).filter((i): i is ShopItemResponseDto => i !== null);

      const total = allItems.length;
      const totalPages = Math.ceil(total / limit);
      result = {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        data: allItems.slice(skip, skip + limit),
      };
    }

    await this.shopCacheService.set(cacheKey, result);
    return result;
  }

  // ─── DETAIL (click en un item) ────────────────────────────────────────────────

  async findById(
    id: number,
    type: 'product' | 'combo',
  ): Promise<ShopDetailResponseDto> {
    // Cache por tipo+id: el detalle incluye imágenes, precio breakdown y stock,
    // todo calculado en una sola llamada.
    const cacheKey = `detail:${type}:${id}`;
    const cached = await this.shopCacheService.get<ShopDetailResponseDto>(cacheKey);
    if (cached) return cached;

    let result: ShopDetailResponseDto;
    if (type === 'product') result = await this.buildProductDetail(id);
    else if (type === 'combo') result = await this.buildComboDetail(id);
    else throw new BadRequestException('Tipo inválido');

    await this.shopCacheService.set(cacheKey, result);
    return result;
  }

  // ─── PRIVATE — buildProductListItem ──────────────────────────────────────────

  private async buildProductListItem(
    product: ProductEntity,
    minPrice?: number,
    maxPrice?: number,
  ): Promise<ShopItemResponseDto | null> {
    // Promise.all: precio y stock se calculan en paralelo para reducir latencia.
    const [priceData, stock] = await Promise.all([
      this.safeCalculateProduct(product.id),
      this.safeGetStockByProduct(product.id),
    ]);

    // Si el producto no tiene precio configurado, se excluye del listado
    // en vez de fallar el request completo.
    if (!priceData) return null;
    if (minPrice !== undefined && priceData.finalPrice < minPrice) return null;
    if (maxPrice !== undefined && priceData.finalPrice > maxPrice) return null;

    // Imagen thumbnail: la de menor position entre las cargadas.
    const image = product.images?.sort((a, b) => a.position - b.position)[0]?.url;

    return {
      id: product.id,
      name: product.name,
      type: 'product',
      originalPrice: priceData.fullPrice,   // precio sin descuento (tachado en el front)
      finalPrice: priceData.finalPrice,      // precio con descuento aplicado
      discountAmount: priceData.discount,
      hasDiscount: priceData.discount > 0,
      inStock: stock ? stock.quantityAvailable > 0 : false,
      quantityAvailable: stock?.quantityAvailable ?? 0,
      image,
    };
  }

  // ─── PRIVATE — buildComboListItem ────────────────────────────────────────────

  private async buildComboListItem(
    combo: ComboEntity,
    minPrice?: number,
    maxPrice?: number,
  ): Promise<ShopItemResponseDto | null> {
    const [priceData, comboStock] = await Promise.all([
      this.safeCalculateCombo(combo.id),
      this.safeGetStockByCombo(combo.id),
    ]);

    if (!priceData) return null;
    if (minPrice !== undefined && priceData.finalPrice < minPrice) return null;
    if (maxPrice !== undefined && priceData.finalPrice > maxPrice) return null;

    const image = combo.images?.sort((a, b) => a.position - b.position)[0]?.url;

    return {
      id: combo.id,
      name: combo.name,
      type: 'combo',
      originalPrice: priceData.fullPrice,
      finalPrice: priceData.finalPrice,
      discountAmount: priceData.discount,
      hasDiscount: priceData.discount > 0,
      inStock: comboStock?.inStock ?? false,
      quantityAvailable: comboStock?.quantityAvailable ?? 0,
      image,
    };
  }

  // ─── PRIVATE — buildProductDetail ────────────────────────────────────────────

  private async buildProductDetail(id: number): Promise<ShopDetailResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true }, // Solo muestra el detalle si el producto está activo.
      relations: ['images'],
    });

    if (!product) throw new NotFoundException('Producto no encontrado');

    const priceData = await this.safeCalculateProduct(id);
    if (!priceData)
      throw new NotFoundException('El producto no tiene precio configurado');

    const stock = await this.safeGetStockByProduct(id);
    const images =
      product.images?.sort((a, b) => a.position - b.position).map((img) => img.url) ?? [];

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      type: 'product',
      originalPrice: priceData.fullPrice,
      finalPrice: priceData.finalPrice,
      discountAmount: priceData.discount,
      priceAfterDiscount: priceData.priceAfterDiscount,
      taxes: priceData.taxes,           // breakdown de impuestos para mostrar en el detalle
      hasDiscount: priceData.discount > 0,
      inStock: stock ? stock.quantityAvailable > 0 : false,
      quantityAvailable: stock?.quantityAvailable ?? 0,
      stockStatus: this.resolveStockStatus(stock),
      images,
    };
  }

  // ─── PRIVATE — buildComboDetail ──────────────────────────────────────────────

  private async buildComboDetail(id: number): Promise<ShopDetailResponseDto> {
    const combo = await this.comboRepository.findOne({
      where: { id, isActive: true },
      relations: ['images', 'items', 'items.product'],
    });

    if (!combo) throw new NotFoundException('Combo no encontrado');

    const priceData = await this.safeCalculateCombo(id);
    if (!priceData)
      throw new NotFoundException('El combo no tiene precio configurado');

    const comboStock = await this.safeGetStockByCombo(id);
    const images =
      combo.images?.sort((a, b) => a.position - b.position).map((img) => img.url) ?? [];

    const items: ComboItemShopDto[] =
      combo.items?.map((item) => ({
        productId: item.productId,
        productName: item.product?.name ?? '',
        quantity: item.quantity,
      })) ?? [];

    return {
      id: combo.id,
      name: combo.name,
      description: combo.description,
      type: 'combo',
      originalPrice: priceData.fullPrice,
      finalPrice: priceData.finalPrice,
      discountAmount: priceData.discount,
      priceAfterDiscount: priceData.priceAfterDiscount,
      taxes: priceData.taxes,
      hasDiscount: priceData.discount > 0,
      inStock: comboStock?.inStock ?? false,
      quantityAvailable: comboStock?.quantityAvailable ?? 0,
      stockStatus: comboStock?.inStock ? 'available' : 'out_of_stock',
      images,
      items, // Lista de productos con sus cantidades, para mostrar el desglose del combo.
    };
  }

  // ─── PRIVATE — safe wrappers ──────────────────────────────────────────────────

  // Los wrappers "safe" atrapan excepciones del CalculationService y StockService.
  // Si un item no tiene precio o stock configurado, el shop lo excluye o lo muestra
  // como sin stock en vez de romper el listado completo.

  private async safeCalculateProduct(
    productId: number,
  ): Promise<PriceBreakdownDto | null> {
    try {
      return await this.calculationService.calculateProduct({ productId });
    } catch {
      return null;
    }
  }

  private async safeCalculateCombo(
    comboId: number,
  ): Promise<PriceBreakdownDto | null> {
    try {
      return await this.calculationService.calculateCombo({ comboId });
    } catch {
      return null;
    }
  }

  private async safeGetStockByProduct(
    productId: number,
  ): Promise<StockItemEntity | null> {
    try {
      return await this.stockItemsService.findByProduct(productId);
    } catch {
      return null;
    }
  }

  private async safeGetStockByCombo(
    comboId: number,
  ): Promise<{ quantityAvailable: number; inStock: boolean } | null> {
    try {
      return await this.stockItemsService.findByCombo(comboId);
    } catch {
      return null;
    }
  }

  // ─── PRIVATE — resolveStockStatus ────────────────────────────────────────────

  private resolveStockStatus(
    stock: StockItemEntity | null,
  ): 'available' | 'low' | 'critical' | 'out_of_stock' {
    // Los umbrales stockCritical y stockMin están configurados por producto.
    // Esta clasificación permite al front mostrar badges de advertencia
    // ("últimas unidades", "stock crítico") sin lógica extra en el cliente.
    if (!stock || stock.quantityAvailable <= 0) return 'out_of_stock';
    if (stock.quantityAvailable <= stock.stockCritical) return 'critical';
    if (stock.quantityAvailable <= stock.stockMin) return 'low';
    return 'available';
  }
}
```
