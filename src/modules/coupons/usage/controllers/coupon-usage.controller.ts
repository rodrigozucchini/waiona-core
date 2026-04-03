import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CouponUsageService } from '../services/coupon-usage.service';
import { CouponUsageResponseDto } from '../dto/coupon-usage-response.dto';

@Controller('coupon-usage')
export class CouponUsageController {

  constructor(private readonly couponUsageService: CouponUsageService) {}

  @Get()
  findAll(): Promise<CouponUsageResponseDto[]> {
    return this.couponUsageService.findAll();
  }

  @Get('coupon/:couponId')
  findByCoupon(
    @Param('couponId', ParseIntPipe) couponId: number,
  ): Promise<CouponUsageResponseDto[]> {
    return this.couponUsageService.findByCoupon(couponId);
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<CouponUsageResponseDto[]> {
    return this.couponUsageService.findByUser(userId);
  }
}