import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { CouponService } from '../services/coupon.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { CouponResponseDto } from '../dto/coupon-response.dto';

@Controller('coupons')
export class CouponController {
  constructor(
    private readonly couponService: CouponService,
  ) {}

  // ==========================
  // CREATE
  // ==========================

  @Post()
  async create(
    @Body() dto: CreateCouponDto,
  ): Promise<CouponResponseDto> {
    return this.couponService.create(dto);
  }

  // ==========================
  // GET ALL
  // ==========================

  @Get()
  async findAll(): Promise<CouponResponseDto[]> {
    return this.couponService.findAll();
  }

  // ==========================
  // GET ONE
  // ==========================

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CouponResponseDto> {
    return this.couponService.findOne(id);
  }

  // ==========================
  // UPDATE (parcial)
  // ==========================

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCouponDto,
  ): Promise<CouponResponseDto> {
    return this.couponService.update(id, dto);
  }

  // ==========================
  // SOFT DELETE
  // ==========================

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.couponService.remove(id);
  }
}