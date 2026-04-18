import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  
  import { CouponProductTargetService } from '../services/coupon-product-target.service';
  import { CreateCouponProductTargetDto } from '../dto/create-coupon-combo-target.dto';
  import { CouponProductTargetResponseDto } from '../dto/coupon-product-target-response.dto';
  
  @Controller('coupons/:couponId/targets/products')
  export class CouponProductTargetController {
    constructor(
      private readonly couponProductTargetService: CouponProductTargetService,
    ) {}
  
    // ==========================
    // CREATE
    // ==========================
  
    @Post()
    async create(
      @Param('couponId', ParseIntPipe) couponId: number,
      @Body() dto: CreateCouponProductTargetDto,
    ): Promise<CouponProductTargetResponseDto> {
      return this.couponProductTargetService.create(couponId, dto);
    }
  
    // ==========================
    // GET ALL BY COUPON
    // ==========================
  
    @Get()
    async findAll(
      @Param('couponId', ParseIntPipe) couponId: number,
    ): Promise<CouponProductTargetResponseDto[]> {
      return this.couponProductTargetService.findAll(couponId);
    }
  
    // ==========================
    // DELETE
    // ==========================
  
    @Delete(':productId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
      @Param('couponId', ParseIntPipe) couponId: number,
      @Param('productId', ParseIntPipe) productId: number,
    ): Promise<void> {
      return this.couponProductTargetService.remove(couponId, productId);
    }
  }