import { StockItemEntity } from '../entities/stock-item.entity';
import { StockMovementResponseDto } from '../../stock-movement/dto/stock-movement-respose.dto';

export class StockItemWithMovementsResponseDto {

  id: number;

  productId: number;

  locationId: number;

  quantityCurrent: number;

  quantityReserved: number;

  quantityAvailable: number;

  stockMin: number;

  stockCritical: number;

  stockMax?: number;

  movements: StockMovementResponseDto[];

  createdAt: Date;

  updatedAt: Date;

  constructor(entity: StockItemEntity) {

    this.id = entity.id;
    this.productId = entity.productId;
    this.locationId = entity.locationId;

    this.quantityCurrent = entity.quantityCurrent;
    this.quantityReserved = entity.quantityReserved;
    this.quantityAvailable = entity.quantityAvailable;

    this.stockMin = entity.stockMin;
    this.stockCritical = entity.stockCritical;
    this.stockMax = entity.stockMax;

    this.movements = entity.movements
      ? entity.movements.map(
          movement => new StockMovementResponseDto(movement),
        )
      : [];

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}