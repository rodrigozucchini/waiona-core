import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    ParseIntPipe,
  } from '@nestjs/common';
  
  import { CouponService } from '../services/coupon.service';
  
  import { CreateCouponDto } from '../dto/create-coupon.dto';
  import { UpdateCouponDto } from '../dto/update-coupon.dto';
  
  @Controller('coupons')
  export class CouponController {
  
    constructor(
      private couponService: CouponService,
    ) {}
  
    @Get()
    getCoupons() {
      return this.couponService.findAll();
    }
  
    @Get(':id')
    findCoupon(
      @Param('id', ParseIntPipe) id: number,
    ) {
      return this.couponService.findById(id);
    }
  
    @Post()
    createCoupon(
      @Body() body: CreateCouponDto,
    ) {
      return this.couponService.create(body);
    }
  
    @Put(':id')
    updateCoupon(
      @Param('id', ParseIntPipe) id: number,
      @Body() changes: UpdateCouponDto,
    ) {
      return this.couponService.update(id, changes);
    }
  
    @Delete(':id')
    deleteCoupon(
      @Param('id', ParseIntPipe) id: number,
    ) {
      return this.couponService.delete(id);
    }
  }