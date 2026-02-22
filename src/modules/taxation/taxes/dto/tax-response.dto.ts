import { TaxEntity } from '../entities/tax.entity';
import { TaxTypeResponseDto } from '../../tax-types/dto/tax-type-response.dto';

export class TaxResponseDto {
  id: number;
  taxTypeId: number;
  value: number;
  isPercentage: boolean;
  createdAt: Date;
  updatedAt: Date;

  // incluimos la relación completa
  taxType?: TaxTypeResponseDto;

  constructor(entity: TaxEntity) {
    this.id = entity.id;
    this.taxTypeId = entity.taxTypeId;
    this.value = Number(entity.value);
    this.isPercentage = entity.isPercentage;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;

    // mapear la relación si existe
    if (entity.taxType) {
      this.taxType = new TaxTypeResponseDto(entity.taxType);
    }
  }
}