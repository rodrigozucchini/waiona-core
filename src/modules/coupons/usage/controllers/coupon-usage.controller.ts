import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CouponUsageService } from '../services/coupon-usage.service';
import { CouponUsageResponseDto } from '../dto/coupon-usage-response.dto';
import { CreateCouponUsageDto } from '../dto/create-coupon-usage.dto';

@Controller('coupon-usage')
export class CouponUsageController {

  constructor(private readonly couponUsageService: CouponUsageService) {}

  @Post()
  create(
    @Body() dto: CreateCouponUsageDto,
  ): Promise<CouponUsageResponseDto> {
    return this.couponUsageService.create(dto);
  }

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