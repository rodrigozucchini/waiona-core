import { DiscountUsageEntity } from '../entities/discount-usage.entity';

export class DiscountUsageResponseDto {
  id: number;
  discountId: number;
  couponId?: number;
  orderId: number;
  userId: number;
  amountSaved: number;
  snapshot: Record<string, any>;
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: DiscountUsageEntity) {
    this.id = entity.id;
    this.discountId = entity.discountId;
    this.couponId = entity.couponId;
    this.orderId = entity.orderId;
    this.userId = entity.userId;
    this.amountSaved = Number(entity.amountSaved);
    this.snapshot = entity.snapshot;
    this.appliedAt = entity.appliedAt;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}