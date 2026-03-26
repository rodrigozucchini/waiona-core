import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { StockMovementService } from '../services/stock-movement.service';
import { StockMovementResponseDto } from '../dto/stock-movement-respose.dto';

@Controller('stock-movements')
export class StockMovementController {

  constructor(
    private readonly stockMovementService: StockMovementService,
  ) {}

  @Get()
  async findAll(): Promise<StockMovementResponseDto[]> {
    return this.stockMovementService.findAll();
  }

  @Get('stock-item/:stockItemId') // 🔥 antes que :id para evitar conflicto de rutas
  async findByStockItemId(
    @Param('stockItemId', ParseIntPipe) stockItemId: number,
  ): Promise<StockMovementResponseDto[]> {
    return this.stockMovementService.findByStockItemId(stockItemId);
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StockMovementResponseDto> {
    return this.stockMovementService.findById(id);
  }
}