import { ProductPricingEntity } from "../entities/product-pricing.entity";

export class ProductPricingResponseDto {

  id: number;
  productId: number;
  currency: string;
  unitPrice: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: ProductPricingEntity) {
    this.id = entity.id;
    this.productId = entity.productId;
    this.currency = entity.currency;
    this.unitPrice = Number(entity.unitPrice);

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }

}