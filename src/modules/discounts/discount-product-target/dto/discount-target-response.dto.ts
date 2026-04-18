import { DiscountProductTargetEntity } from "../entities/discount-product-target.entity";

export class DiscountProductTargetResponseDto {

  id: number;
  discountId: number;
  productId: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: DiscountProductTargetEntity) {
    this.id = entity.id;
    this.discountId = entity.discountId;
    this.productId = entity.productId;

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }

}