import { TaxEntity } from '../entities/tax.entity';

export class TaxResponseDto {

  id: number;

  taxTypeId: number;

  value: number;

  isPercentage: boolean;

  createdAt: Date;

  updatedAt: Date;

  constructor(entity: TaxEntity) {
    this.id = entity.id;
    this.taxTypeId = entity.taxTypeId;
    this.value = Number(entity.value);
    this.isPercentage = entity.isPercentage;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }

}