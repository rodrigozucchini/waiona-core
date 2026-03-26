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

import { StockLocationsService } from '../services/stock-locations.service';
import { CreateStockLocationDto } from '../dto/create-stock-location.dto';
import { UpdateStockLocationDto } from '../dto/update-stock-location.dto';
import { StockLocationResponseDto } from '../dto/stock-location-response.dto';

@Controller('stock-locations')
export class StockLocationsController {
  constructor(
    private readonly stockLocationsService: StockLocationsService,
  ) {}

  // ==========================
  // CREATE
  // ==========================

  @Post()
  async create(
    @Body() dto: CreateStockLocationDto,
  ): Promise<StockLocationResponseDto> {
    return this.stockLocationsService.create(dto);
  }

  // ==========================
  // GET ALL
  // ==========================

  @Get()
  async findAll(): Promise<StockLocationResponseDto[]> {
    return this.stockLocationsService.findAll();
  }

  // ==========================
  // GET ONE
  // ==========================

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StockLocationResponseDto> {
    return this.stockLocationsService.findOne(id);
  }

  // ==========================
  // UPDATE
  // ==========================

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStockLocationDto,
  ): Promise<StockLocationResponseDto> {
    return this.stockLocationsService.update(id, dto);
  }

  // ==========================
  // DELETE (soft)
  // ==========================

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.stockLocationsService.remove(id);
  }
}