import { CouponCategoryTargetEntity } from '../entities/coupon-category-target.entity';

export class CouponCategoryTargetResponseDto {
  id: number;
  couponId: number;
  categoryId: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: CouponCategoryTargetEntity) {
    this.id = entity.id;
    this.couponId = entity.couponId;
    this.categoryId = entity.categoryId;

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}