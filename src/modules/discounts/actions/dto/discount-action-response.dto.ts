import { DiscountActionEntity } from '../entities/discount-action.entity';
import { DiscountActionType } from '../enum/action-type.enum';
import { AppliesToType } from '../enum/discount-action-type.enum';

export class DiscountActionResponseDto {
  id: number;
  discountId: number;
  type: DiscountActionType;
  value: number;
  currency?: string;
  appliesTo: AppliesToType;
  maxDiscount?: number;
  buyQty?: number;
  getQty?: number;
  freeProductId?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: DiscountActionEntity) {
    this.id = entity.id;
    this.discountId = entity.discountId;
    this.type = entity.type;
    this.value = Number(entity.value);
    this.currency = entity.currency;
    this.appliesTo = entity.appliesTo;
    this.maxDiscount = entity.maxDiscount
      ? Number(entity.maxDiscount)
      : undefined;
    this.buyQty = entity.buyQty;
    this.getQty = entity.getQty;
    this.freeProductId = entity.freeProductId;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}