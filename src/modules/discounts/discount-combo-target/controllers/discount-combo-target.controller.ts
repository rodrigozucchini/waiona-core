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

import { DiscountComboTargetService } from '../services/discount-combo-target.service';
import { CreateDiscountComboTargetDto } from '../dto/create-discount-combo-target.dto';
import { DiscountComboTargetResponseDto } from '../dto/discount-combo-target.dto';

@Controller('discounts/:discountId/targets/combos')
export class DiscountComboTargetController {

  constructor(
    private readonly service: DiscountComboTargetService,
  ) {}

  // ==========================
  // CREATE
  // ==========================

  @Post()
  async create(
    @Param('discountId', ParseIntPipe) discountId: number,
    @Body() dto: CreateDiscountComboTargetDto,
  ): Promise<DiscountComboTargetResponseDto> {
    return this.service.create(discountId, dto);
  }

  // ==========================
  // GET ALL BY DISCOUNT
  // ==========================

  @Get()
  async findAll(
    @Param('discountId', ParseIntPipe) discountId: number,
  ): Promise<DiscountComboTargetResponseDto[]> {
    return this.service.findAll(discountId);
  }

  // ==========================
  // DELETE
  // ==========================

  @Delete(':comboId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('discountId', ParseIntPipe) discountId: number,
    @Param('comboId', ParseIntPipe) comboId: number,
  ): Promise<void> {
    return this.service.remove(discountId, comboId);
  }
}
