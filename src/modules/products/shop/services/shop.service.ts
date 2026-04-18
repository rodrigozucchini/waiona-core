import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

import { ProductEntity } from '../../product/entities/product.entity';
import { ComboEntity } from '../../combos/entities/combo.entity';

import { SearchShopDto } from '../dto/search-shop.dto';
import { ShopPaginatedResponseDto } from '../dto/shop-paginated-response.dto';
import { ShopItemResponseDto } from '../dto/shop-response.dto';
import { ShopDetailResponseDto, ComboItemShopDto } from '../dto/shop-detail-response.dto';

import { CalculationService } from 'src/modules/pricing/calculation/services/calculation.service';
import { StockItemsService } from 'src/modules/stocks/stock-item/services/stock-item.service';
import { PriceBreakdownDto } from 'src/modules/pricing/calculation/dto/price-breakdown.dto';
import { StockItemEntity } from 'src/modules/stocks/stock-item/entities/stock-item.entity';

@Injectable()
export class ShopService {

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    @InjectRepository(ComboEntity)
    private readonly comboRepository: Repository<ComboEntity>,

    private readonly calculationService: CalculationService,
    private readonly stockItemsService: StockItemsService,
  ) {}

  // ==========================
  // SEARCH (LISTADO)
  // ==========================

  async search(dto: SearchShopDto): Promise<ShopPaginatedResponseDto> {
    const { search, type, page = 1, limit = 20, minPrice, maxPrice, categoryId } = dto;
    const skip = (page - 1) * limit;

    let data: ShopItemResponseDto[] = [];
    let total = 0;

    // ==========================
    // PRODUCTS
    // ==========================
    if (!type || type === 'product') {

      const where: any = { isDeleted: false, isActive: true };

      if (search) where.name = ILike(`%${search}%`);

      // 🔥 categoryId ahora se aplica (requiere FK en ProductEntity)
      if (categoryId) where.categoryId = categoryId;

      const [products, count] = await this.productRepository.findAndCount({
        where,
        relations: ['images'],
        order: { name: 'ASC' },
        take: limit,
        skip,
      });

      total += count;

      const productItems = await Promise.all(
        products.map(p => this.buildProductListItem(p, minPrice, maxPrice)),
      );

      // filtra nulls (sin pricing o fuera de rango de precio)
      data.push(...productItems.filter((i): i is ShopItemResponseDto => i !== null));
    }

    // ==========================
    // COMBOS
    // ==========================
    if (!type || type === 'combo') {

      const where: any = { isDeleted: false, isActive: true };

      if (search) where.name = ILike(`%${search}%`);

      const [combos, count] = await this.comboRepository.findAndCount({
        where,
        relations: ['images'],
        order: { name: 'ASC' },
        take: limit,
        skip,
      });

      total += count;

      const comboItems = await Promise.all(
        combos.map(c => this.buildComboListItem(c, minPrice, maxPrice)),
      );

      data.push(...comboItems.filter((i): i is ShopItemResponseDto => i !== null));
    }

    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      data,
    };
  }

  // ==========================
  // DETAIL (CLICK)
  // ==========================

  async findById(
    id: number,
    type: 'product' | 'combo',
  ): Promise<ShopDetailResponseDto> {

    if (!type) {
      throw new BadRequestException('type is required (product | combo)');
    }

    if (type === 'product') return this.buildProductDetail(id);
    if (type === 'combo')   return this.buildComboDetail(id);

    throw new BadRequestException('Invalid type');
  }

  // ==========================
  // PRIVATE — PRODUCT LIST ITEM
  // ==========================

  private async buildProductListItem(
    product: ProductEntity,
    minPrice?: number,
    maxPrice?: number,
  ): Promise<ShopItemResponseDto | null> {

    // 🔥 si no tiene pricing lo skipeamos en vez de explotar
    const priceData = await this.safeCalculateProduct(product.id);
    if (!priceData) return null;

    // 🔥 filtro de precio aplicado acá (no en SQL, porque el precio viene de pricing)
    if (minPrice !== undefined && priceData.finalPrice < minPrice) return null;
    if (maxPrice !== undefined && priceData.finalPrice > maxPrice) return null;

    const stock = await this.safeGetStockByProduct(product.id);

    // imagen ordenada por position
    const image = product.images
      ?.sort((a, b) => a.position - b.position)[0]?.url;

    return {
      id: product.id,
      name: product.name,
      type: 'product',
      originalPrice:     priceData.fullPrice,
      finalPrice:        priceData.finalPrice,
      discountAmount:    priceData.discount,
      hasDiscount:       priceData.discount > 0,       // 🔥 corrección clave
      inStock:           stock ? stock.quantityAvailable > 0 : false,
      quantityAvailable: stock?.quantityAvailable ?? 0,
      image,
    };
  }

  // ==========================
  // PRIVATE — COMBO LIST ITEM
  // ==========================

  private async buildComboListItem(
    combo: ComboEntity,
    minPrice?: number,
    maxPrice?: number,
  ): Promise<ShopItemResponseDto | null> {

    const priceData = await this.safeCalculateCombo(combo.id);
    if (!priceData) return null;

    if (minPrice !== undefined && priceData.finalPrice < minPrice) return null;
    if (maxPrice !== undefined && priceData.finalPrice > maxPrice) return null;

    // combos no tienen stock propio — se podría calcular en base a items, por ahora true si tiene pricing
    const image = combo.images
      ?.sort((a, b) => a.position - b.position)[0]?.url;

    return {
      id: combo.id,
      name: combo.name,
      type: 'combo',
      originalPrice:     priceData.fullPrice,
      finalPrice:        priceData.finalPrice,
      discountAmount:    priceData.discount,
      hasDiscount:       priceData.discount > 0,
      inStock:           true,   // TODO: calcular en base al stock de cada item del combo
      quantityAvailable: 0,
      image,
    };
  }

  // ==========================
  // PRIVATE — PRODUCT DETAIL
  // ==========================

  private async buildProductDetail(id: number): Promise<ShopDetailResponseDto> {

    const product = await this.productRepository.findOne({
      where: { id, isDeleted: false, isActive: true },
      relations: ['images'],
    });

    if (!product) throw new NotFoundException('Product not found');

    const priceData = await this.safeCalculateProduct(id);
    if (!priceData) throw new NotFoundException('Product has no pricing configured');

    const stock = await this.safeGetStockByProduct(id);

    const images = product.images
      ?.sort((a, b) => a.position - b.position)
      .map(img => img.url) ?? [];

    return {
      id:                  product.id,
      name:                product.name,
      description:         product.description,      // 🔥 antes nunca se asignaba
      type:                'product',
      originalPrice:       priceData.fullPrice,
      finalPrice:          priceData.finalPrice,
      discountAmount:      priceData.discount,
      priceAfterDiscount:  priceData.priceAfterDiscount,
      taxes:               priceData.taxes,
      hasDiscount:         priceData.discount > 0,   // 🔥 corrección clave
      inStock:             stock ? stock.quantityAvailable > 0 : false,
      quantityAvailable:   stock?.quantityAvailable ?? 0,
      stockStatus:         this.resolveStockStatus(stock),
      images,
    };
  }

  // ==========================
  // PRIVATE — COMBO DETAIL
  // ==========================

  private async buildComboDetail(id: number): Promise<ShopDetailResponseDto> {

    const combo = await this.comboRepository.findOne({
      where: { id, isDeleted: false, isActive: true },
      relations: ['images', 'items', 'items.product'],  // 🔥 antes no cargaba items ni imágenes
    });

    if (!combo) throw new NotFoundException('Combo not found');

    const priceData = await this.safeCalculateCombo(id);
    if (!priceData) throw new NotFoundException('Combo has no pricing configured');

    const images = combo.images
      ?.sort((a, b) => a.position - b.position)
      .map(img => img.url) ?? [];

    const items: ComboItemShopDto[] = combo.items?.map(item => ({
      productId:   item.productId,
      productName: item.product?.name ?? '',
      quantity:    item.quantity,
    })) ?? [];

    return {
      id:                  combo.id,
      name:                combo.name,
      description:         combo.description,
      type:                'combo',
      originalPrice:       priceData.fullPrice,
      finalPrice:          priceData.finalPrice,
      discountAmount:      priceData.discount,
      priceAfterDiscount:  priceData.priceAfterDiscount,
      taxes:               priceData.taxes,
      hasDiscount:         priceData.discount > 0,
      inStock:             true,   // TODO: calcular en base al stock de cada item del combo
      quantityAvailable:   0,
      stockStatus:         'available',
      images,
      items,
    };
  }

  // ==========================
  // PRIVATE — SAFE WRAPPERS
  // 🔥 evitan que un producto sin pricing explote todo el listado
  // ==========================

  private async safeCalculateProduct(productId: number): Promise<PriceBreakdownDto | null> {
    try {
      return await this.calculationService.calculateProduct({ productId });
    } catch {
      return null;
    }
  }

  private async safeCalculateCombo(comboId: number): Promise<PriceBreakdownDto | null> {
    try {
      return await this.calculationService.calculateCombo({ comboId });
    } catch {
      return null;
    }
  }

  private async safeGetStockByProduct(productId: number): Promise<StockItemEntity | null> {
    try {
      return await this.stockItemsService.findByProduct(productId);
    } catch {
      return null;
    }
  }

  // ==========================
  // PRIVATE — STOCK STATUS
  // ==========================

  private resolveStockStatus(
    stock: StockItemEntity | null,
  ): 'available' | 'low' | 'critical' | 'out_of_stock' {

    if (!stock || stock.quantityAvailable <= 0) return 'out_of_stock';
    if (stock.quantityAvailable <= stock.stockCritical)  return 'critical';
    if (stock.quantityAvailable <= stock.stockMin)       return 'low';
    return 'available';
  }
}