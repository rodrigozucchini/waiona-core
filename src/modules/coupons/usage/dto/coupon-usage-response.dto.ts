import { ApiProperty } from '@nestjs/swagger';

import { CouponUsageEntity } from '../entities/coupon-usage.entity';

export class CouponUsageResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  couponId: number;

  @ApiProperty({ example: 1 })
  orderId: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty()
  appliedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
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
