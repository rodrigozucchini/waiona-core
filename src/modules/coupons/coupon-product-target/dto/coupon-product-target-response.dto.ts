import { ApiProperty } from '@nestjs/swagger';

import { CouponProductTargetEntity } from '../entities/coupon-product-target.entity';

export class CouponProductTargetResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  couponId: number;

  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(entity: CouponProductTargetEntity) {
    this.id = entity.id;
    this.couponId = entity.couponId;
    this.productId = entity.productId;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}
