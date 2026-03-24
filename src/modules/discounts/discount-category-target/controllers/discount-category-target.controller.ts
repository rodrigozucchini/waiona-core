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

import { DiscountCategoryTargetService } from '../services/discount-category-target.service';
import { CreateDiscountCategoryTargetDto } from '../dto/create-discount-category-target.dto';
import { DiscountCategoryTargetResponseDto } from '../dto/discount-category-target.dto';

@Controller('discounts/:discountId/targets/categories')
export class DiscountCategoryTargetController {

  constructor(
    private readonly service: DiscountCategoryTargetService,
  ) {}

  // ==========================
  // CREATE
  // ==========================

  @Post()
  async create(
    @Param('discountId', ParseIntPipe) discountId: number,
    @Body() dto: CreateDiscountCategoryTargetDto,
  ): Promise<DiscountCategoryTargetResponseDto> {
    return this.service.create(discountId, dto);
  }

  // ==========================
  // GET ALL BY DISCOUNT
  // ==========================

  @Get()
  async findAll(
    @Param('discountId', ParseIntPipe) discountId: number,
  ): Promise<DiscountCategoryTargetResponseDto[]> {
    return this.service.findAll(discountId);
  }

  // ==========================
  // DELETE
  // ==========================

  @Delete(':categoryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('discountId', ParseIntPipe) discountId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<void> {
    return this.service.remove(discountId, categoryId);
  }
}