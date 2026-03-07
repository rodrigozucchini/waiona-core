import { Module } from '@nestjs/common';
import { StockLocationsService } from './stock-locations/services/stock-locations.service';
import { StockLocationsController } from './stock-locations/stock-locations.controller';
import { StockItemService } from './stock-item/stock-item.service';
import { StockItemController } from './stock-item/stock-item.controller';

@Module({
  providers: [StockLocationsService, StockItemService],
  controllers: [StockLocationsController, StockItemController]
})
export class StocksModule {}
