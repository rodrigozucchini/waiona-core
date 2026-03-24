import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CouponEntity } from './coupon/entities/coupon.entity';
import { CouponService } from './coupon/services/coupon.service';
import { CouponController } from './coupon/controllers/coupon.controller';
import { CouponCategoryTargetService } from './coupon-category-target/services/coupon-category-target.service';
import { CouponUsageService } from './usage/services/coupon-usage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CouponEntity]),
  ],
  controllers: [CouponController],
  providers: [CouponService, CouponCategoryTargetService, CouponUsageService],
  exports: [CouponService], // 🔥 por si otros módulos necesitan validar/aplicar cupones
})
export class CouponsModule {}