import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';

import { StockItemsService } from '../services/stock-item.service';

import { CreateStockItemDto } from '../dto/create-stock-item.dto';

import { StockItemResponseDto } from '../dto/stock-item-response.dto';
import { StockItemWithMovementsResponseDto } from '../dto/stock-item-with-movements-response.dto';

@Controller('stock-items')
export class StockItemsController {

  constructor(
    private readonly stockItemsService: StockItemsService,
  ) {}

  // ==========================
  // GET ALL
  // ==========================

  @Get()
  async findAll(): Promise<StockItemResponseDto[]> {
    return this.stockItemsService.findAll();
  }

  // ==========================
  // GET BY ID (WITH MOVEMENTS)
  // ==========================

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StockItemWithMovementsResponseDto> {

    return this.stockItemsService.findById(id);
  }

  // ==========================
  // CREATE INITIAL STOCK
  // ==========================

  @Post()
  async create(
    @Body() dto: CreateStockItemDto,
  ): Promise<StockItemWithMovementsResponseDto> {

    return this.stockItemsService.create(dto);
  }

}