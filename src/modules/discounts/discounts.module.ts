import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DiscountEntity } from './discount/entities/discounts.entity';
import { CouponEntity } from './coupon/entities/coupon.entity';
import { DiscountUsageEntity } from './usage/entities/discount-usage.entity';

import { DiscountsService } from './discount/services/discounts.service';
import { CouponService } from './coupon/services/coupon.service';
import { DiscountUsageService } from './usage/services/discount-usage.service';

import { DiscountsController } from './discount/controllers/discounts.controller';
import { DiscountUsageController } from './usage/controllers/discount-usage.controller';
import { CouponController } from './coupon/controllers/coupon.controller';
import { DiscountProductTargetService } from './discount-product-target/services/discount-product-target.service';
import { DiscountProductTargetController } from './discount-product-target/controllers/discount-product-target.controller';
import { DiscountCategoryTargetService } from './discount-category-target/services/discount-category-target.service';
import { DiscountCategoryTargetController } from './discount-category-target/controllers/discount-category-target.controller';
import { DiscountComboTargetEntity } from './discount-combo-target/entities/discount-combo-target.entity';
import { DiscountProductTargetEntity } from './discount-product-target/entities/discount-product-target.entity';
import { DiscountCategoryTargetEntity } from './discount-category-target/entities/discount-category-target.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DiscountEntity,
      CouponEntity,
  //    DiscountUsageEntity,
      DiscountProductTargetEntity,
      DiscountComboTargetEntity,
      DiscountCategoryTargetEntity
    ]),
  ],
  providers: [
    DiscountsService,
    CouponService,
//    DiscountUsageService,
    DiscountProductTargetService,
    DiscountCategoryTargetService,
    DiscountComboTargetEntity,
  ],
  controllers: [
    DiscountsController,
    CouponController,
 //   DiscountUsageController,
    DiscountProductTargetController,
    DiscountCategoryTargetController,
  ],
  exports: [
    DiscountsService,
  ],
})
export class DiscountsModule {}