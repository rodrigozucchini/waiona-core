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
  
  import { CouponComboTargetService } from '../services/coupon-combo-target.service';
  import { CreateCouponComboTargetDto } from '../dto/create-coupon-combo-target.dto';
  import { CouponComboTargetResponseDto } from '../dto/coupon-combo-target-response.dto';
  
  @Controller('coupons/:couponId/targets/combos')
  export class CouponComboTargetController {
    constructor(
      private readonly couponComboTargetService: CouponComboTargetService,
    ) {}
  
    // ==========================
    // CREATE
    // ==========================
  
    @Post()
    async create(
      @Param('couponId', ParseIntPipe) couponId: number,
      @Body() dto: CreateCouponComboTargetDto,
    ): Promise<CouponComboTargetResponseDto> {
      return this.couponComboTargetService.create(couponId, dto);
    }
  
    // ==========================
    // GET ALL BY COUPON
    // ==========================
  
    @Get()
    async findAll(
      @Param('couponId', ParseIntPipe) couponId: number,
    ): Promise<CouponComboTargetResponseDto[]> {
      return this.couponComboTargetService.findAll(couponId);
    }
  
    // ==========================
    // DELETE
    // ==========================
  
    @Delete(':comboId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
      @Param('couponId', ParseIntPipe) couponId: number,
      @Param('comboId', ParseIntPipe) comboId: number,
    ): Promise<void> {
      return this.couponComboTargetService.remove(couponId, comboId);
    }
  }