import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, ILike } from 'typeorm';
  
  import { ProductEntity } from '../../product/entities/product.entity';
  import { ComboEntity } from '../../combos/entities/combo.entity';
  
  import { SearchShopDto } from '../dto/search-shop.dto';
  import { ShopPaginatedResponseDto } from '../dto/shop-paginated-response.dto';
  import { ShopItemResponseDto } from '../dto/shop-response.dto';
  import { ShopDetailResponseDto } from '../dto/shop-detail-response.dto';
  
  import { CalculationService } from 'src/modules/pricing/calculation/services/calculation.service';
  
  @Injectable()
  export class ShopService {
    constructor(
      @InjectRepository(ProductEntity)
      private readonly productRepository: Repository<ProductEntity>,
  
      @InjectRepository(ComboEntity)
      private readonly comboRepository: Repository<ComboEntity>,
  
      private readonly calculationService: CalculationService,
    ) {}
  
    // ==========================
    // SEARCH (LISTADO)
    // ==========================
    async search(dto: SearchShopDto): Promise<ShopPaginatedResponseDto> {
      const {
        search,
        type,
        page = 1,
        limit = 10,
      } = dto;
  
      const skip = (page - 1) * limit;
  
      let data: ShopItemResponseDto[] = [];
      let total = 0;
  
      // ==========================
      // PRODUCTS
      // ==========================
      if (!type || type === 'product') {
        const where: any = {
          isDeleted: false,
        };
  
        if (search) {
          where.name = ILike(`%${search}%`);
        }
  
        const [products, count] = await this.productRepository.findAndCount({
          where,
          relations: ['images'], // solo si existe
          order: { name: 'ASC' },
          take: limit,
          skip,
        });
  
        total += count;
  
        const productItems = await Promise.all(
          products.map(async (p): Promise<ShopItemResponseDto> => {
            const priceData = await this.calculationService.calculateProduct({
              productId: p.id,
            });
  
            return {
              id: p.id,
              name: p.name,
              price: priceData.finalPrice,
              type: 'product',
              image: p.images?.[0]?.url,
            };
          }),
        );
  
        data.push(...productItems);
      }
  
      // ==========================
      // COMBOS
      // ==========================
      if (!type || type === 'combo') {
        const where: any = {
          isDeleted: false,
        };
  
        if (search) {
          where.name = ILike(`%${search}%`);
        }
  
        const [combos, count] = await this.comboRepository.findAndCount({
          where,
          order: { name: 'ASC' },
          take: limit,
          skip,
        });
  
        total += count;
  
        const comboItems = await Promise.all(
          combos.map(async (c): Promise<ShopItemResponseDto> => {
            const priceData = await this.calculationService.calculateCombo({
              comboId: c.id,
            });
  
            return {
              id: c.id,
              name: c.name,
              price: priceData.finalPrice,
              type: 'combo',
            };
          }),
        );
  
        data.push(...comboItems);
      }
  
      return {
        total,
        page,
        limit,
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
        throw new BadRequestException('Type is required (product | combo)');
      }
  
      // ==========================
      // PRODUCT
      // ==========================
      if (type === 'product') {
        const product = await this.productRepository.findOne({
          where: { id, isDeleted: false },
          relations: ['images'],
        });
  
        if (!product) {
          throw new NotFoundException('Product not found');
        }
  
        const priceData = await this.calculationService.calculateProduct({
          productId: product.id,
        });
  
        return {
          id: product.id,
          name: product.name,
          type: 'product',
          basePrice: priceData.unitPrice,
          finalPrice: priceData.finalPrice,
          discount: priceData.discount,
          hasDiscount: priceData.finalPrice < priceData.unitPrice,
          images: product.images?.map(img => img.url) ?? [],
        };
      }
  
      // ==========================
      // COMBO
      // ==========================
      if (type === 'combo') {
        const combo = await this.comboRepository.findOne({
          where: { id, isDeleted: false },
        });
  
        if (!combo) {
          throw new NotFoundException('Combo not found');
        }
  
        const priceData = await this.calculationService.calculateCombo({
          comboId: combo.id,
        });
  
        return {
          id: combo.id,
          name: combo.name,
          type: 'combo',
          basePrice: priceData.unitPrice,
          finalPrice: priceData.finalPrice,
          discount: priceData.discount,
          hasDiscount: priceData.finalPrice < priceData.unitPrice,
          images: [], // ajustar si combos tienen imágenes
        };
      }
  
      throw new BadRequestException('Invalid type');
    }
  }