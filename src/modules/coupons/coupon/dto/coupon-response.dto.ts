import { CouponEntity } from '../entities/coupon.entity';
import { CouponStatus } from '../enums/coupon-status.enum';
import { CurrencyCode } from 'src/common/enums/currency-code.enum';

export class CouponResponseDto {
  id: number;
  code: string;

  status: CouponStatus;

  value: number;
  isPercentage: boolean;
  currency?: CurrencyCode;

  isGlobal: boolean;

  usageLimit?: number;
  usageCount: number;

  startsAt?: Date;
  endsAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: CouponEntity) {
    this.id = entity.id;
    this.code = entity.code;

    this.value = Number(entity.value);
    this.isPercentage = entity.isPercentage;
    this.currency = entity.currency ?? undefined;

    this.isGlobal = entity.isGlobal;

    this.usageLimit = entity.usageLimit ?? undefined;
    this.usageCount = entity.usageCount;

    this.startsAt = entity.startsAt ?? undefined;
    this.endsAt = entity.endsAt ?? undefined;

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;

    this.status = this.calculateStatus(entity);
  }

  private calculateStatus(entity: CouponEntity): CouponStatus {
    const now = new Date();
    const { startsAt, endsAt, usageLimit, usageCount } = entity;

    // Guarda contra dato corrupto
    if (startsAt && endsAt && endsAt < startsAt) {
      return CouponStatus.EXPIRED;
    }

    // Agotado por uso
    if (usageLimit !== null && usageLimit !== undefined && usageCount >= usageLimit) {
      return CouponStatus.EXHAUSTED;
    }

    if (endsAt && now > endsAt) {
      return CouponStatus.EXPIRED;
    }

    if (startsAt && now < startsAt) {
      return CouponStatus.SCHEDULED;
    }

    return CouponStatus.ACTIVE;
  }
}