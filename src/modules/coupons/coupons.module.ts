import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CouponEntity } from './coupon/entities/coupon.entity';
import { CouponService } from './coupon/services/coupon.service';
import { CouponController } from './coupon/controllers/coupon.controller';
import { CouponCategoryTargetService } from './coupon-category-target/coupon-category-target.service';
import { CouponCategoryTargetController } from './coupon-category-target/coupon-category-target.controller';
import { CouponComboTargetService } from './coupon-combo-target/coupon-combo-target.service';
import { CouponComboTargetController } from './coupon-combo-target/coupon-combo-target.controller';
import { CouponProductTargetController } from './coupon-product-target/coupon-product-target.controller';
import { CouponProductTargetService } from './coupon-product-target/coupon-product-target.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CouponEntity]),
  ],
  controllers: [CouponController, CouponCategoryTargetController, CouponComboTargetController, CouponProductTargetController],
  providers: [CouponService, CouponCategoryTargetService, CouponComboTargetService, CouponProductTargetService],
  exports: [CouponService], // 🔥 por si otros módulos necesitan validar/aplicar cupones
})
export class CouponsModule {}