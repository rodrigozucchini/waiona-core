import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DiscountEntity } from './discount/entities/discounts.entity';

import { DiscountsService } from './discount/services/discounts.service';

import { DiscountsController } from './discount/controllers/discounts.controller';
import { DiscountProductTargetService } from './discount-product-target/services/discount-product-target.service';
import { DiscountProductTargetController } from './discount-product-target/controllers/discount-product-target.controller';
import { DiscountComboTargetEntity } from './discount-combo-target/entities/discount-combo-target.entity';
import { DiscountProductTargetEntity } from './discount-product-target/entities/discount-product-target.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DiscountEntity,
  //    DiscountUsageEntity,
      DiscountProductTargetEntity,
      DiscountComboTargetEntity,
    ]),
  ],
  providers: [
    DiscountsService,
//    DiscountUsageService,
    DiscountProductTargetService,
    DiscountComboTargetEntity,
  ],
  controllers: [
    DiscountsController,
 //   DiscountUsageController,
    DiscountProductTargetController,
  ],
  exports: [
    DiscountsService,
  ],
})
export class DiscountsModule {}