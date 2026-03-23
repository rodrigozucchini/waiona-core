import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { DiscountsService } from '../services/discounts.service';
import { CreateDiscountDto } from '../dto/create-discount.dto';
import { UpdateDiscountDto } from '../dto/update-discount.dto';
import { DiscountResponseDto } from '../dto/response-discount.dto';

@Controller('discounts')
export class DiscountsController {
  constructor(
    private readonly discountsService: DiscountsService,
  ) {}

  // ==========================
  // CREATE
  // ==========================

  @Post()
  async create(
    @Body() dto: CreateDiscountDto,
  ): Promise<DiscountResponseDto> {
    return this.discountsService.create(dto);
  }

  // ==========================
  // GET ALL
  // ==========================

  @Get()
  async findAll(): Promise<DiscountResponseDto[]> {
    return this.discountsService.findAll();
  }

  // ==========================
  // GET ONE
  // ==========================

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DiscountResponseDto> {
    return this.discountsService.findOne(id);
  }

  // ==========================
  // UPDATE (parcial)
  // ==========================

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiscountDto,
  ): Promise<DiscountResponseDto> {
    return this.discountsService.update(id, dto);
  }

  // ==========================
  // SOFT DELETE
  // ==========================

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.discountsService.remove(id);
  }
}