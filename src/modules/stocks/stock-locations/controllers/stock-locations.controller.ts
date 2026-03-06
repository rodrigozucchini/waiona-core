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
  
  import { StockLocationsService } from '../services/stock-locations.service';
  
  import { CreateStockLocationDto } from '../dto/create-stock-location.dto';
  import { UpdateStockLocationDto } from '../dto/update-stock-location.dto';
  import { StockLocationResponseDto } from '../dto/stock-location-response.dto';
  
  @Controller('stock-locations')
  export class StockLocationsController {
    constructor(
      private readonly stockLocationsService: StockLocationsService,
    ) {}
  
    // CREATE
    @Post()
    create(
      @Body() dto: CreateStockLocationDto,
    ): Promise<StockLocationResponseDto> {
      return this.stockLocationsService.create(dto);
    }
  
    // GET ALL
    @Get()
    findAll(): Promise<StockLocationResponseDto[]> {
      return this.stockLocationsService.findAll();
    }
  
    // GET BY ID
    @Get(':id')
    findOne(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<StockLocationResponseDto> {
      return this.stockLocationsService.findOne(id);
    }
  
    // UPDATE
    @Patch(':id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateStockLocationDto,
    ): Promise<StockLocationResponseDto> {
      return this.stockLocationsService.update(id, dto);
    }
  
    // DELETE (soft delete)
    @Delete(':id')
    remove(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
      return this.stockLocationsService.remove(id);
    }
  }