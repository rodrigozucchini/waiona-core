import { StockItemEntity } from '../entities/stock-item.entity';

export class StockItemResponseDto {

  id: number;

  productId: number;

  locationId: number;
  locationName: string;

  quantityCurrent: number;
  quantityAvailable: number;

  stockMin: number;
  stockCritical: number;
  stockMax?: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: StockItemEntity) {
    this.id = entity.id;

    this.productId = entity.productId;

    this.locationId = entity.locationId;
    this.locationName = entity.location?.name ?? '';

    this.quantityCurrent = entity.quantityCurrent;
    this.quantityAvailable = entity.quantityAvailable;

    this.stockMin = entity.stockMin;
    this.stockCritical = entity.stockCritical;
    this.stockMax = entity.stockMax;

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}