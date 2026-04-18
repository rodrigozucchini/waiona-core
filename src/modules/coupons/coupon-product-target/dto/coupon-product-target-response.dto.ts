import { CouponProductTargetEntity } from '../entities/coupon-product-target.entity';

export class CouponProductTargetResponseDto {
  id: number;
  couponId: number;
  productId: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: CouponProductTargetEntity) {
    this.id = entity.id;
    this.couponId = entity.couponId;
    this.productId = entity.productId;

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}