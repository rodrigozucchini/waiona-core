import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { ProductPricingEntity } from '../entities/product-pricing.entity';
  import { CreateProductPricingDto } from '../dto/create-product-pricing.dto';
  import { UpdateProductPricingDto } from '../dto/update-product-pricing-dto';
  import { ProductPricingResponseDto } from '../dto/product-pricing-response.dto';
  
  @Injectable()
  export class ProductPricingService {
  
    constructor(
      @InjectRepository(ProductPricingEntity)
      private repo: Repository<ProductPricingEntity>,
    ) {}
  
    async create(
      dto: CreateProductPricingDto,
    ): Promise<ProductPricingResponseDto> {
  
      const existing = await this.repo.findOne({
        where: {
          productId: dto.productId,
          isDeleted: false,
        },
      });
  
      if (existing) {
        throw new BadRequestException(
          'Product already has pricing',
        );
      }
  
      const entity = this.repo.create(dto);
      const saved = await this.repo.save(entity);
  
      return new ProductPricingResponseDto(saved);
    }
  
    async update(
      id: number,
      dto: UpdateProductPricingDto,
    ): Promise<ProductPricingResponseDto> {
  
      const entity = await this.repo.findOne({
        where: { id, isDeleted: false },
      });
  
      if (!entity) {
        throw new NotFoundException('Product pricing not found');
      }
  
      if (dto.productId && dto.productId !== entity.productId) {
        const existing = await this.repo.findOne({
          where: {
            productId: dto.productId,
            isDeleted: false,
          },
        });
  
        if (existing) {
          throw new BadRequestException(
            'Product already has pricing',
          );
        }
      }
  
      Object.assign(entity, dto);
      const saved = await this.repo.save(entity);
  
      return new ProductPricingResponseDto(saved);
    }
  
    async findAll(): Promise<ProductPricingResponseDto[]> {
      const entities = await this.repo.find({
        where: { isDeleted: false },
      });
  
      return entities.map(
        (e) => new ProductPricingResponseDto(e),
      );
    }
  
    async findOne(id: number): Promise<ProductPricingResponseDto> {
      const entity = await this.repo.findOne({
        where: { id, isDeleted: false },
      });
  
      if (!entity) {
        throw new NotFoundException('Product pricing not found');
      }
  
      return new ProductPricingResponseDto(entity);
    }
  
    // 🔥 FIX
    async findByProduct(
      productId: number,
    ): Promise<ProductPricingResponseDto> {
  
      const entity = await this.repo.findOne({
        where: {
          productId,
          isDeleted: false,
        },
      });
  
      if (!entity) {
        throw new NotFoundException('Product pricing not found');
      }
  
      return new ProductPricingResponseDto(entity);
    }
  
    async remove(id: number): Promise<void> {
      const entity = await this.repo.findOne({
        where: { id, isDeleted: false },
      });
  
      if (!entity) {
        throw new NotFoundException('Product pricing not found');
      }
  
      entity.isDeleted = true;
      await this.repo.save(entity);
    }
  }