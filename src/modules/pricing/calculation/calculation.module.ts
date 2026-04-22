import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductPricingEntity } from '../entities/product-pricing.entity';
import { ComboPricingEntity } from '../entities/combo-pricing.entity';
import { ProductTaxEntity } from 'src/modules/taxation/product-taxes/entities/product-taxes.entity';
import { ComboTaxEntity } from 'src/modules/taxation/combo-taxes/entities/combo-taxes.entity';
import { TaxEntity } from 'src/modules/taxation/taxes/entities/tax.entity';
import { DiscountProductTargetEntity } from 'src/modules/discounts/discount-product-target/entities/discount-product-target.entity';
import { DiscountComboTargetEntity } from 'src/modules/discounts/discount-combo-target/entities/discount-combo-target.entity';
import { CouponEntity } from 'src/modules/coupons/coupon/entities/coupon.entity';
import { CouponProductTargetEntity } from 'src/modules/coupons/coupon-product-target/entities/coupon-product-target.entity';
import { CouponComboTargetEntity } from 'src/modules/coupons/coupon-combo-target/entities/coupon-combo-target.entity';

import { CalculationService } from './services/calculation.service';
import { CalculationController } from './controllers/calculation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductPricingEntity,
      ComboPricingEntity,
      ProductTaxEntity,
      ComboTaxEntity,
      TaxEntity,
      DiscountProductTargetEntity,
      DiscountComboTargetEntity,
      CouponEntity,
      CouponProductTargetEntity,  // 🔥 para validar targets en applyCoupon
      CouponComboTargetEntity,    // 🔥 para validar targets en applyCoupon
    ]),
  ],
  controllers: [CalculationController],
  providers: [CalculationService],
  exports: [CalculationService],
})
export class CalculationModule {}