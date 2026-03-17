import { Controller, Get, Param } from '@nestjs/common';

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

  @Get(':id')
  async findById(
    @Param('id') id: number,
  ): Promise<StockMovementResponseDto> {
    return this.stockMovementService.findById(id);
  }

  @Get('stock-item/:stockItemId')
  async findByStockItemId(
    @Param('stockItemId') stockItemId: number,
  ): Promise<StockMovementResponseDto[]> {
    return this.stockMovementService.findByStockItemId(stockItemId);
  }

}