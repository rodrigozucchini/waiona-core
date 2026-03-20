import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DiscountEntity } from './discount/entities/discounts.entity';
import { DiscountActionEntity } from './actions/entities/discount-action.entity';
import { CouponEntity } from './coupon/entities/coupon.entity';
import { DiscountUsageEntity } from './usage/entities/discount-usage.entity';
import { DiscountConditionEntity } from './conditions/entities/discount-condition.entity';

import { DiscountsService } from './discount/services/discounts.service';
import { DiscountActionsService } from './actions/services/discount-actions.service';
import { CouponService } from './coupon/services/coupon.service';
import { DiscountUsageService } from './usage/services/discount-usage.service';
import { DiscountConditionService } from './conditions/services/discount-condition.service';

import { DiscountsController } from './discount/controllers/discounts.controller';
import { DiscountUsageController } from './usage/controllers/discount-usage.controller';
import { DiscountConditionController } from './conditions/controllers/discount-condition.controller';
import { DiscountActionsController } from './actions/controllers/discount-actions.controller';
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
      DiscountActionEntity,
      CouponEntity,
      DiscountUsageEntity,
      DiscountConditionEntity,
      DiscountProductTargetEntity,
      DiscountComboTargetEntity,
      DiscountCategoryTargetEntity
    ]),
  ],
  providers: [
    DiscountsService,
    DiscountActionsService,
    CouponService,
    DiscountUsageService,
    DiscountConditionService,
    DiscountProductTargetService,
    DiscountCategoryTargetService,
    DiscountComboTargetEntity,
  ],
  controllers: [
    DiscountsController,
    DiscountActionsController,
    CouponController,
    DiscountUsageController,
    DiscountConditionController,
    DiscountProductTargetController,
    DiscountCategoryTargetController,
  ],
  exports: [
    DiscountsService,
  ],
})
export class DiscountsModule {}