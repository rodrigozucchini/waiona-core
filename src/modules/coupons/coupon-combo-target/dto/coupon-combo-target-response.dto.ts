import { CouponComboTargetEntity } from '../entities/coupon-combo-target.entity';

export class CouponComboTargetResponseDto {
  id: number;
  couponId: number;
  comboId: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: CouponComboTargetEntity) {
    this.id = entity.id;
    this.couponId = entity.couponId;
    this.comboId = entity.comboId;

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}