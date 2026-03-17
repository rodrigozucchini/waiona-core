import { DiscountCategoryTargetEntity } from "../entities/discount-category-target.entity";

export class DiscountCategoryTargetResponseDto {

  id: number;
  discountId: number;
  categoryId: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: DiscountCategoryTargetEntity) {
    this.id = entity.id;
    this.discountId = entity.discountId;
    this.categoryId = entity.categoryId;

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }

}