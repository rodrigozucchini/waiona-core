import { ProductPricingEntity } from "../entities/product-pricing.entity";
import { CurrencyCode } from "src/common/enums/currency-code.enum";

export class ProductPricingResponseDto {

  id: number;
  productId: number;
  currency: CurrencyCode;
  unitPrice: number;
  marginId?: number | null;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: ProductPricingEntity) {
    this.id = entity.id;
    this.productId = entity.productId;
    this.currency = entity.currency;
    this.unitPrice = Number(entity.unitPrice);
    this.marginId = entity.margin?.id ?? null;

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}