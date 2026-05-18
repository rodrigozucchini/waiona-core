import { ApiProperty } from '@nestjs/swagger';

import { CouponComboTargetEntity } from '../entities/coupon-combo-target.entity';

export class CouponComboTargetResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  couponId: number;

  @ApiProperty({ example: 1 })
  comboId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(entity: CouponComboTargetEntity) {
    this.id = entity.id;
    this.couponId = entity.couponId;
    this.comboId = entity.comboId;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}
