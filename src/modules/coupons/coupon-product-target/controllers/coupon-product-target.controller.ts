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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CouponProductTargetService } from '../services/coupon-product-target.service';
import { CreateCouponProductTargetDto } from '../dto/create-coupon-combo-target.dto';
import { CouponProductTargetResponseDto } from '../dto/coupon-product-target-response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleType } from 'src/common/enums/role-type.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('coupons/:couponId/targets/products')
export class CouponProductTargetController {
  constructor(
    private readonly couponProductTargetService: CouponProductTargetService,
  ) {}

  @Post()
  async create(
    @Param('couponId', ParseIntPipe) couponId: number,
    @Body() dto: CreateCouponProductTargetDto,
  ): Promise<CouponProductTargetResponseDto> {
    return this.couponProductTargetService.create(couponId, dto);
  }

  @Get()
  async findAll(
    @Param('couponId', ParseIntPipe) couponId: number,
  ): Promise<CouponProductTargetResponseDto[]> {
    return this.couponProductTargetService.findAll(couponId);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('couponId', ParseIntPipe) couponId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<void> {
    return this.couponProductTargetService.remove(couponId, productId);
  }
}