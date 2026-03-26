import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    ParseIntPipe,
  } from '@nestjs/common';
  
  import { StockWriteOffService } from '../services/stock-writeoff.service';
  import { UpdateStockWriteOffDto } from '../dto/update-stock-writeoff.dto';
  import { StockWriteOffResponseDto } from '../dto/stock-writeoff-response.dto';
  
  @Controller('stock-write-offs')
  export class StockWriteOffController {
  
    constructor(
      private readonly stockWriteOffService: StockWriteOffService,
    ) {}
  
    // ==========================
    // GET ALL
    // ==========================
  
    @Get()
    async findAll(): Promise<StockWriteOffResponseDto[]> {
      return this.stockWriteOffService.findAll();
    }
  
    // ==========================
    // GET BY STOCK ITEM
    // ==========================
  
    @Get('stock-item/:stockItemId') // 🔥 antes que :id
    async findByStockItemId(
      @Param('stockItemId', ParseIntPipe) stockItemId: number,
    ): Promise<StockWriteOffResponseDto[]> {
      return this.stockWriteOffService.findByStockItemId(stockItemId);
    }
  
    // ==========================
    // GET BY ID
    // ==========================
  
    @Get(':id')
    async findById(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<StockWriteOffResponseDto> {
      return this.stockWriteOffService.findById(id);
    }
  
    // ==========================
    // UPDATE
    // ==========================
  
    @Patch(':id')
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateStockWriteOffDto,
    ): Promise<StockWriteOffResponseDto> {
      return this.stockWriteOffService.update(id, dto);
    }
  }