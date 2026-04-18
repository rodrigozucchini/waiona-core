import { ComboPricingEntity } from "../entities/combo-pricing.entity";
import { CurrencyCode } from "src/common/enums/currency-code.enum";

export class ComboPricingResponseDto {

  id: number;
  comboId: number;
  currency: CurrencyCode;
  unitPrice: number;
  marginId?: number | null;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: ComboPricingEntity) {
    this.id = entity.id;
    this.comboId = entity.comboId;
    this.currency = entity.currency;
    this.unitPrice = Number(entity.unitPrice);
    this.marginId = entity.margin?.id ?? null;

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}