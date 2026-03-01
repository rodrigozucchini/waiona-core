import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { DiscountUsageEntity } from '../entities/discount-usage.entity';
  import { DiscountEntity } from '../../discount/entities/discounts.entity';
  import { CouponEntity } from '../../coupon/entities/coupon.entity';
  
  import { CreateDiscountUsageDto } from '../dto/create-discount-usage.dto';
  import { UpdateDiscountUsageDto } from '../dto/update-discount-usage.dto';
  import { DiscountUsageResponseDto } from '../dto/discount-usage-response.dto';
  
  @Injectable()
  export class DiscountUsageService {
  
    constructor(
      @InjectRepository(DiscountUsageEntity)
      private discountUsageRepository: Repository<DiscountUsageEntity>,
  
      @InjectRepository(DiscountEntity)
      private discountRepository: Repository<DiscountEntity>,
  
      @InjectRepository(CouponEntity)
      private couponRepository: Repository<CouponEntity>,
    ) {}
  
    async findAll(): Promise<DiscountUsageResponseDto[]> {
  
      const entities = await this.discountUsageRepository.find({
        where: { isDeleted: false },
        relations: ['discount', 'coupon'],
        order: { createdAt: 'DESC' },
      });
  
      return entities.map(
        entity => new DiscountUsageResponseDto(entity),
      );
    }
  
    async findById(id: number): Promise<DiscountUsageResponseDto> {
  
      const entity = await this.findOne(id);
  
      return new DiscountUsageResponseDto(entity);
    }
  
    async create(
      dto: CreateDiscountUsageDto,
    ): Promise<DiscountUsageResponseDto> {
  
      const discount = await this.discountRepository.findOne({
        where: { id: dto.discountId, isDeleted: false },
      });
  
      if (!discount) {
        throw new BadRequestException(
          `Discount with id ${dto.discountId} not found`,
        );
      }
  
      let coupon: CouponEntity | null = null;
  
      if (dto.couponId) {
        coupon = await this.couponRepository.findOne({
          where: { id: dto.couponId, isDeleted: false },
        });
  
        if (!coupon) {
          throw new BadRequestException(
            `Coupon with id ${dto.couponId} not found`,
          );
        }
  
        if (!coupon.isActive) {
          throw new BadRequestException(`Coupon is not active`);
        }
  
        if (
          coupon.usageLimit &&
          coupon.usageCount >= coupon.usageLimit
        ) {
          throw new BadRequestException(
            `Coupon usage limit reached`,
          );
        }
      }
  
      if (
        discount.usageLimit &&
        discount.usageCount >= discount.usageLimit
      ) {
        throw new BadRequestException(
          `Discount usage limit reached`,
        );
      }
  
      const newEntity = this.discountUsageRepository.create({
        ...dto,
      });
  
      const saved = await this.discountUsageRepository.save(newEntity);
  
      discount.usageCount += 1;
      await this.discountRepository.save(discount);
  
      if (coupon) {
        coupon.usageCount += 1;
        await this.couponRepository.save(coupon);
      }
  
      const entityWithRelation = await this.findOne(saved.id);
  
      return new DiscountUsageResponseDto(entityWithRelation);
    }
  
    async update(
      id: number,
      changes: UpdateDiscountUsageDto,
    ): Promise<DiscountUsageResponseDto> {
  
      const entity = await this.findOne(id);
  
      const merged = this.discountUsageRepository.merge(entity, changes);
  
      const saved = await this.discountUsageRepository.save(merged);
  
      return new DiscountUsageResponseDto(saved);
    }
  
    async delete(id: number): Promise<void> {
  
      const entity = await this.findOne(id);
  
      entity.isDeleted = true;
  
      await this.discountUsageRepository.save(entity);
    }
  
    private async findOne(id: number): Promise<DiscountUsageEntity> {
  
      const entity = await this.discountUsageRepository.findOne({
        where: {
          id,
          isDeleted: false,
        },
        relations: ['discount', 'coupon'],
      });
  
      if (!entity) {
        throw new NotFoundException(
          `DiscountUsage with id ${id} not found`,
        );
      }
  
      return entity;
    }
  }