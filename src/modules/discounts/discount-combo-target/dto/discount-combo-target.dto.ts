import { DiscountComboTargetEntity } from "../entities/discount-combo-target.entity";

export class DiscountComboTargetResponseDto {

  id: number;
  discountId: number;
  comboId: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: DiscountComboTargetEntity) {
    this.id = entity.id;
    this.discountId = entity.discountId;
    this.comboId = entity.comboId;

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }

}