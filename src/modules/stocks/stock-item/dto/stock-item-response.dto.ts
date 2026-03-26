import { StockItemEntity } from '../entities/stock-item.entity';

export class StockItemResponseDto {

  id: number;
  productId: number;
  locationId: number;
  locationName: string;

  quantityCurrent: number;
  quantityReserved: number;
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
    this.locationName = entity.location?.name ?? ''; // 🔥 ok si se carga la relación

    this.quantityCurrent = entity.quantityCurrent;
    this.quantityReserved = entity.quantityReserved;
    this.quantityAvailable = entity.quantityAvailable;

    this.stockMin = entity.stockMin;
    this.stockCritical = entity.stockCritical;
    this.stockMax = entity.stockMax ?? undefined; // 🔥 null → undefined

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}