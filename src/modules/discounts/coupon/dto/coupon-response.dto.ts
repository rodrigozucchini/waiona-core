import { CouponEntity } from '../entities/coupon.entity';
import { CouponType } from '../enums/coupon-type.enum';

export class CouponResponseDto {
  id: number;
  discountId: number;
  code: string;
  type: CouponType;
  userId?: number;
  usageLimit?: number;
  usageCount: number;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: CouponEntity) {
    this.id = entity.id;
    this.discountId = entity.discountId;
    this.code = entity.code;
    this.type = entity.type;
    this.userId = entity.userId;
    this.usageLimit = entity.usageLimit;
    this.usageCount = entity.usageCount;
    this.expiresAt = entity.expiresAt;
    this.isActive = entity.isActive;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}