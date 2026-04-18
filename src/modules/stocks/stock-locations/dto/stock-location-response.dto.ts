import { StockLocationEntity } from '../entities/stock-locations.entity';
import { StockLocationType } from '../enums/stock-location-type.enum';

export class StockLocationResponseDto {

  id: number;
  name: string;
  type: StockLocationType;
  address?: string;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: StockLocationEntity) {
    this.id = entity.id;
    this.name = entity.name;
    this.type = entity.type;
    this.address = entity.address ?? undefined; // 🔥 null → undefined

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}