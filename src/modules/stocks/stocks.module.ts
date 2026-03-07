import { Module } from '@nestjs/common';
import { StockLocationsService } from './stock-locations/services/stock-locations.service';
import { StockLocationsController } from './stock-locations/controllers/stock-locations.controller';

@Module({
  providers: [StockLocationsService],
  controllers: [StockLocationsController]
})
export class StocksModule {}
