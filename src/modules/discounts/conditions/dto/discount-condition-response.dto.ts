import { DiscountConditionEntity } from '../entities/discount-condition.entity';
import { DiscountConditionType } from '../enums/discount-condition-type.enum';
import { DiscountOperator } from '../enums/discount-operator.enum';

export class DiscountConditionResponseDto {
  id: number;
  discountId: number;
  type: DiscountConditionType;
  operator: DiscountOperator;
  value: Record<string, any>;
  qtyMin?: number;
  qtyMax?: number;
  amountMin?: number;
  amountMax?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: DiscountConditionEntity) {
    this.id = entity.id;
    this.discountId = entity.discountId;
    this.type = entity.type;
    this.operator = entity.operator;
    this.value = entity.value;
    this.qtyMin = entity.qtyMin;
    this.qtyMax = entity.qtyMax;
    this.amountMin = entity.amountMin
      ? Number(entity.amountMin)
      : undefined;
    this.amountMax = entity.amountMax
      ? Number(entity.amountMax)
      : undefined;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}