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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DiscountEntity,
      DiscountActionEntity,
      CouponEntity,
      DiscountUsageEntity,
      DiscountConditionEntity,
    ]),
  ],
  providers: [
    DiscountsService,
    DiscountActionsService,
    CouponService,
    DiscountUsageService,
    DiscountConditionService,
  ],
  controllers: [
    DiscountsController,
    DiscountActionsController,
    CouponController,
    DiscountUsageController,
    DiscountConditionController,
  ],
  exports: [
    DiscountsService,
  ],
})
export class DiscountsModule {}