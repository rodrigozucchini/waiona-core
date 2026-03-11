import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';

import { StockItemsService } from '../services/stock-item.service';

import { CreateStockItemDto } from '../dto/create-stock-item.dto';
import { UpdateStockThresholdsDto } from '../dto/update-stock-thresholds.dto';

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
  // CREATE STOCK ITEM
  // ==========================

  @Post()
  async create(
    @Body() dto: CreateStockItemDto,
  ): Promise<StockItemResponseDto> {

    return this.stockItemsService.create(dto);
  }

  // ==========================
  // ADD STOCK
  // ==========================

  @Post('add-stock')
  async addStock(
    @Body('productId', ParseIntPipe) productId: number,
    @Body('locationId', ParseIntPipe) locationId: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ): Promise<StockItemWithMovementsResponseDto> {

    return this.stockItemsService.addStock(
      productId,
      locationId,
      quantity,
    );
  }

  // ==========================
  // UPDATE STOCK THRESHOLDS
  // ==========================

  @Patch(':id/thresholds')
  async updateThresholds(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStockThresholdsDto,
  ): Promise<StockItemResponseDto> {

    return this.stockItemsService.updateThresholds(id, dto);
  }

}
