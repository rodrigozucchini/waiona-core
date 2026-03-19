import { ComboPricingEntity } from "../entities/combo-pricing.entity";

export class ComboPricingResponseDto {

  id: number;
  comboId: number;
  currency: string;
  unitPrice: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: ComboPricingEntity) {
    this.id = entity.id;
    this.comboId = entity.comboId;
    this.currency = entity.currency;
    this.unitPrice = Number(entity.unitPrice);

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }

}