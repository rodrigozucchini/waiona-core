import { CouponUsageEntity } from '../entities/coupon-usage.entity';

export class CouponUsageResponseDto {
  id: number;
  couponId: number;
  orderId: number;
  userId: number;
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: CouponUsageEntity) {
    this.id = entity.id;
    this.couponId = entity.couponId;
    this.orderId = entity.orderId;
    this.userId = entity.userId;
    this.appliedAt = entity.appliedAt;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}