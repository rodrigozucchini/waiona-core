import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CouponEntity } from './coupon/entities/coupon.entity';
import { CouponCategoryTargetEntity } from './coupon-category-target/entities/coupon-category-target.entity';
import { CouponProductTargetEntity } from './coupon-product-target/entities/coupon-product-target.entity';
import { CouponComboTargetEntity } from './coupon-combo-target/entities/coupon-combo-target.entity';
import { CouponUsageEntity } from './usage/entities/coupon-usage.entity';

import { CouponService } from './coupon/services/coupon.service';
import { CouponCategoryTargetService } from './coupon-category-target/services/coupon-category-target.service';
import { CouponProductTargetService } from './coupon-product-target/services/coupon-product-target.service';
import { CouponComboTargetService } from './coupon-combo-target/services/coupon-combo-target.service';
import { CouponUsageService } from './usage/services/coupon-usage.service';

import { CouponController } from './coupon/controllers/coupon.controller';
import { CouponCategoryTargetController } from './coupon-category-target/controllers/coupon-category-target.controller';
import { CouponProductTargetController } from './coupon-product-target/controllers/coupon-product-target.controller';
import { CouponComboTargetController } from './coupon-combo-target/controllers/coupon-combo-target.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CouponEntity,
      CouponCategoryTargetEntity,
      CouponProductTargetEntity,
      CouponComboTargetEntity,
      CouponUsageEntity,
    ]),
  ],
  controllers: [
    CouponController,
    CouponCategoryTargetController,
    CouponProductTargetController,
    CouponComboTargetController,
  ],
  providers: [
    CouponService,
    CouponCategoryTargetService,
    CouponProductTargetService,
    CouponComboTargetService,
    CouponUsageService,
  ],
  exports: [CouponService],
})
export class CouponsModule {}