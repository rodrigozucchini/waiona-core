import { ProductEntity } from '../entities/product.entity';

export class ProductResponseDto {

  id: number;
  sku: string;
  name: string;
  description: string;
  isActive: boolean;
  measurementUnit: string;
  measurementValue?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: ProductEntity) {
    this.id = entity.id;
    this.sku = entity.sku;
    this.name = entity.name;
    this.description = entity.description;
    this.isActive = entity.isActive;
    this.measurementUnit = entity.measurementUnit;
    this.measurementValue = entity.measurementValue
      ? Number(entity.measurementValue)
      : undefined;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}