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

import { CouponComboTargetService } from '../services/coupon-combo-target.service';
import { CreateCouponComboTargetDto } from '../dto/create-coupon-combo-target.dto';
import { CouponComboTargetResponseDto } from '../dto/coupon-combo-target-response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleType } from 'src/common/enums/role-type.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('coupons/:couponId/targets/combos')
export class CouponComboTargetController {
  constructor(
    private readonly couponComboTargetService: CouponComboTargetService,
  ) {}

  @Post()
  async create(
    @Param('couponId', ParseIntPipe) couponId: number,
    @Body() dto: CreateCouponComboTargetDto,
  ): Promise<CouponComboTargetResponseDto> {
    return this.couponComboTargetService.create(couponId, dto);
  }

  @Get()
  async findAll(
    @Param('couponId', ParseIntPipe) couponId: number,
  ): Promise<CouponComboTargetResponseDto[]> {
    return this.couponComboTargetService.findAll(couponId);
  }

  @Delete(':comboId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('couponId', ParseIntPipe) couponId: number,
    @Param('comboId', ParseIntPipe) comboId: number,
  ): Promise<void> {
    return this.couponComboTargetService.remove(couponId, comboId);
  }
}