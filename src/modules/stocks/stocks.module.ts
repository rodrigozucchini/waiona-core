import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StockLocationsService } from './stock-locations/services/stock-locations.service';
import { StockLocationsController } from './stock-locations/controllers/stock-locations.controller';

import { StockMovementService } from './stock-movement/services/stock-movement.service';
import { StockMovementController } from './stock-movement/controllers/stock-movement.controller';

import { StockLocationEntity } from './stock-locations/entities/stock-locations.entity';
import { StockMovementEntity } from './stock-movement/entities/stock-movement.entity';
import { StockItemEntity } from './stock-item/entities/stock-item.entity';
import { StockItemsService } from './stock-item/services/stock-item.service';
import { StockItemsController } from './stock-item/controllers/stock-item.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StockLocationEntity,
      StockMovementEntity,
      StockItemEntity,
    ]),
  ],
  providers: [
    StockLocationsService,
    StockMovementService,
    StockItemsService,
  ],
  controllers: [
    StockLocationsController,
    StockMovementController,
    StockItemsController,
  ],
  exports: [    
    StockLocationsService,
    StockMovementService,
    StockItemsService,    
  ],
})
export class StocksModule {}