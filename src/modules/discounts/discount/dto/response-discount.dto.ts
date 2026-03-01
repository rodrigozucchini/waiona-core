import { DiscountEntity } from "../entities/discounts.entity";
import { DiscountStatus } from '../enums/discount-status.enum';

export class DiscountResponseDto {
  id: number;
  name: string;
  description?: string;
  status: DiscountStatus;
  exclusive: boolean;
  usageLimit?: number;
  usageCount: number;
  startsAt?: Date;
  endsAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: DiscountEntity) {
    this.id = entity.id;
    this.name = entity.name;
    this.description = entity.description;
    this.status = entity.status;
    this.exclusive = entity.exclusive;
    this.usageLimit = entity.usageLimit;
    this.usageCount = entity.usageCount;
    this.startsAt = entity.startsAt;
    this.endsAt = entity.endsAt;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}