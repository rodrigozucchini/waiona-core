import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductPricingEntity } from '../entities/product-pricing.entity';
import { MarginEntity } from 'src/modules/margins/entities/margin.entity';
import { CreateProductPricingDto } from '../dto/create-product-pricing.dto';
import { UpdateProductPricingDto } from '../dto/update-product-pricing-dto';
import { ProductPricingResponseDto } from '../dto/product-pricing-response.dto';

@Injectable()
export class ProductPricingService {

  constructor(
    @InjectRepository(ProductPricingEntity)
    private repo: Repository<ProductPricingEntity>,

    @InjectRepository(MarginEntity)
    private marginRepo: Repository<MarginEntity>,
  ) {}

  // ==========================
  // CREATE
  // ==========================

  async create(dto: CreateProductPricingDto): Promise<ProductPricingResponseDto> {

    const existing = await this.repo.findOne({
      where: { productId: dto.productId, isDeleted: false },
    });

    if (existing) {
      throw new BadRequestException('Product already has pricing');
    }

    const margin = dto.marginId
      ? await this.resolveMargin(dto.marginId)
      : null;

    const entity = this.repo.create({
      productId: dto.productId,
      currency: dto.currency,
      unitPrice: dto.unitPrice,
      margin,
    });

    const saved = await this.repo.save(entity);
    return new ProductPricingResponseDto(saved);
  }

  // ==========================
  // UPDATE
  // ==========================

  async update(id: number, dto: UpdateProductPricingDto): Promise<ProductPricingResponseDto> {

    const entity = await this.findOneEntity(id);

    if (dto.productId && dto.productId !== entity.productId) {
      const existing = await this.repo.findOne({
        where: { productId: dto.productId, isDeleted: false },
      });
      if (existing) {
        throw new BadRequestException('Product already has pricing');
      }
    }

    if (dto.marginId !== undefined) {
      entity.margin = dto.marginId
        ? await this.resolveMargin(dto.marginId)
        : null;
    }

    Object.assign(entity, {
      productId: dto.productId ?? entity.productId,
      currency: dto.currency ?? entity.currency,
      unitPrice: dto.unitPrice ?? entity.unitPrice,
    });

    const saved = await this.repo.save(entity);
    return new ProductPricingResponseDto(saved);
  }

  // ==========================
  // FIND ALL
  // ==========================

  async findAll(): Promise<ProductPricingResponseDto[]> {
    const entities = await this.repo.find({
      where: { isDeleted: false },
      relations: ['margin'],
    });
    return entities.map((e) => new ProductPricingResponseDto(e));
  }

  // ==========================
  // FIND ONE
  // ==========================

  async findOne(id: number): Promise<ProductPricingResponseDto> {
    const entity = await this.findOneEntity(id);
    return new ProductPricingResponseDto(entity);
  }

  // ==========================
  // FIND BY PRODUCT
  // ==========================

  async findByProduct(productId: number): Promise<ProductPricingResponseDto> {
    const entity = await this.repo.findOne({
      where: { productId, isDeleted: false },
      relations: ['margin'],
    });

    if (!entity) {
      throw new NotFoundException('Product pricing not found');
    }

    return new ProductPricingResponseDto(entity);
  }

  // ==========================
  // REMOVE
  // ==========================

  async remove(id: number): Promise<void> {
    const entity = await this.findOneEntity(id);
    entity.isDeleted = true;
    await this.repo.save(entity);
  }

  // ==========================
  // HELPERS
  // ==========================

  private async findOneEntity(id: number): Promise<ProductPricingEntity> {
    const entity = await this.repo.findOne({
      where: { id, isDeleted: false },
      relations: ['margin'],
    });

    if (!entity) {
      throw new NotFoundException('Product pricing not found');
    }

    return entity;
  }

  private async resolveMargin(marginId: number): Promise<MarginEntity> {
    const margin = await this.marginRepo.findOne({
      where: { id: marginId, isDeleted: false },
    });

    if (!margin) {
      throw new NotFoundException(`Margin with id ${marginId} not found`);
    }

    return margin;
  }
}