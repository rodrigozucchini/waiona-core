import {
    Injectable,
    NotFoundException,
    ConflictException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { CouponCategoryTargetEntity } from '../../coupon-category-target/entities/coupon-category-target.entity';
  import { CouponEntity } from '../../coupon/entities/coupon.entity';
  import { CreateCouponCategoryTargetDto } from '../../coupon-category-target/dto/create-coupon-category-target.dto';
  import { CouponCategoryTargetResponseDto } from '../../coupon-category-target/dto/coupon-category-target-response.dto';
  
  @Injectable()
  export class CouponCategoryTargetService {
  
    constructor(
      @InjectRepository(CouponCategoryTargetEntity)
      private readonly repo: Repository<CouponCategoryTargetEntity>,
      @InjectRepository(CouponEntity)
      private readonly couponRepository: Repository<CouponEntity>,
    ) {}
  
    // ==========================
    // CREATE
    // ==========================
  
    async create(
      couponId: number,
      dto: CreateCouponCategoryTargetDto,
    ): Promise<CouponCategoryTargetResponseDto> {
  
      // 🔥 validar que el cupón exista y no esté eliminado
      await this.findCoupon(couponId);
  
      // 🔥 validar que el cupón no sea global — no tiene sentido asignar targets a uno global
      await this.validateCouponNotGlobal(couponId);
  
      // 🔥 validar que no exista ya este par couponId + categoryId
      await this.validateUniqueTarget(couponId, dto.categoryId);
  
      const entity = this.repo.create({
        couponId,
        categoryId: dto.categoryId,
      });
  
      const saved = await this.repo.save(entity);
  
      return new CouponCategoryTargetResponseDto(saved);
    }
  
    // ==========================
    // GET ALL BY COUPON
    // ==========================
  
    async findAll(couponId: number): Promise<CouponCategoryTargetResponseDto[]> {
      await this.findCoupon(couponId);
  
      const targets = await this.repo.find({
        where: { couponId, isDeleted: false },
      });
  
      return targets.map((t) => new CouponCategoryTargetResponseDto(t));
    }
  
    // ==========================
    // DELETE (soft)
    // ==========================
  
    async remove(couponId: number, categoryId: number): Promise<void> {
      await this.findCoupon(couponId);
  
      const entity = await this.repo.findOne({
        where: { couponId, categoryId, isDeleted: false },
      });
  
      if (!entity) {
        throw new NotFoundException(
          `Category target ${categoryId} not found for coupon ${couponId}`,
        );
      }
  
      entity.isDeleted = true;
      await this.repo.save(entity);
    }
  
    // ==========================
    // PRIVATE HELPERS
    // ==========================
  
    private async findCoupon(couponId: number): Promise<CouponEntity> {
      const coupon = await this.couponRepository.findOne({
        where: { id: couponId, isDeleted: false },
      });
  
      if (!coupon) {
        throw new NotFoundException(`Coupon with id ${couponId} not found`);
      }
  
      return coupon;
    }
  
    private async validateCouponNotGlobal(couponId: number): Promise<void> {
      const coupon = await this.findCoupon(couponId);
  
      if (coupon.isGlobal) {
        throw new ConflictException(
          'Cannot assign targets to a global coupon',
        );
      }
    }
  
    private async validateUniqueTarget(
      couponId: number,
      categoryId: number,
    ): Promise<void> {
      const existing = await this.repo.findOne({
        where: { couponId, categoryId, isDeleted: false },
      });
  
      if (existing) {
        throw new ConflictException(
          `Category ${categoryId} is already a target of coupon ${couponId}`,
        );
      }
    }
  }