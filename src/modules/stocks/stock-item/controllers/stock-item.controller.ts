import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    ParseIntPipe,
  } from '@nestjs/common';
  
  import { StockItemsService } from '../services/stock-item.service';
  
  import { CreateStockItemDto } from '../dto/create-stock-item.dto';
  import { UpdateStockItemDto } from '../dto/update-stock-item.dto';
  import { UpdateStockThresholdsDto } from '../dto/update-stock-thresholds.dto';
  import { QueryStockItemsDto } from '../dto/query-stock-item.dto';
  
  import { StockItemResponseDto } from '../dto/stock-item-response.dto';
  
  @Controller('stock-items')
  export class StockItemsController {
  
    constructor(
      private readonly stockItemsService: StockItemsService,
    ) {}
  
    // ==========================
    // GET ALL
    // ==========================
  
    @Get()
    async findAll(
      @Query() query: QueryStockItemsDto,
    ): Promise<StockItemResponseDto[]> {
  
      return this.stockItemsService.findAll(query);
    }
  
    // ==========================
    // GET BY ID
    // ==========================
  
    @Get(':id')
    async findById(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<StockItemResponseDto> {
  
      return this.stockItemsService.findById(id);
    }
  
    // ==========================
    // GET BY PRODUCT
    // ==========================
  
    @Get('product/:productId')
    async findByProduct(
      @Param('productId', ParseIntPipe) productId: number,
    ): Promise<StockItemResponseDto[]> {
  
      return this.stockItemsService.findByProduct(productId);
    }
  
    // ==========================
    // GET BY LOCATION
    // ==========================
  
    @Get('location/:locationId')
    async findByLocation(
      @Param('locationId', ParseIntPipe) locationId: number,
    ): Promise<StockItemResponseDto[]> {
  
      return this.stockItemsService.findByLocation(locationId);
    }
  
    // ==========================
    // CREATE
    // ==========================
  
    @Post()
    async create(
      @Body() dto: CreateStockItemDto,
    ): Promise<StockItemResponseDto> {
  
      return this.stockItemsService.create(dto);
    }
  
    // ==========================
    // UPDATE
    // ==========================
  
    @Patch(':id')
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateStockItemDto,
    ): Promise<StockItemResponseDto> {
  
      return this.stockItemsService.update(id, dto);
    }
  
    // ==========================
    // UPDATE THRESHOLDS
    // ==========================
  
    @Patch(':id/thresholds')
    async updateThresholds(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateStockThresholdsDto,
    ): Promise<StockItemResponseDto> {
  
      return this.stockItemsService.updateThresholds(id, dto);
    }
  
    // ==========================
    // DELETE
    // ==========================
  
    @Delete(':id')
    async delete(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
  
      return this.stockItemsService.delete(id);
    }
  
  }