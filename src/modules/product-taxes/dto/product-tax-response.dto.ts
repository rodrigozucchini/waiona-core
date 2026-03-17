import { ProductTaxEntity } from '../entities/product-tax.entity';

export class ProductTaxResponseDto {

  id: number;
  productId: number;
  taxId: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: ProductTaxEntity) {
    this.id = entity.id;
    this.productId = entity.productId;
    this.taxId = entity.taxId;

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }

}