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

import { DiscountProductTargetService } from '../services/discount-product-target.service';
import { CreateDiscountProductTargetDto } from '../dto/create-discount-product-target.dto';
import { DiscountProductTargetResponseDto } from '../dto/discount-target-response.dto';

@Controller('discounts/:discountId/targets/products')
export class DiscountProductTargetController {

  constructor(
    private readonly service: DiscountProductTargetService,
  ) {}

  // ==========================
  // CREATE
  // ==========================

  @Post()
  async create(
    @Param('discountId', ParseIntPipe) discountId: number,
    @Body() dto: CreateDiscountProductTargetDto,
  ): Promise<DiscountProductTargetResponseDto> {
    return this.service.create(discountId, dto);
  }

  // ==========================
  // GET ALL BY DISCOUNT
  // ==========================

  @Get()
  async findAll(
    @Param('discountId', ParseIntPipe) discountId: number,
  ): Promise<DiscountProductTargetResponseDto[]> {
    return this.service.findAll(discountId);
  }

  // ==========================
  // DELETE
  // ==========================

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('discountId', ParseIntPipe) discountId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<void> {
    return this.service.remove(discountId, productId);
  }
}