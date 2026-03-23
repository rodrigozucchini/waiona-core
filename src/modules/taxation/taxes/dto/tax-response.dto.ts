import { TaxEntity } from '../entities/tax.entity';
import { TaxTypeResponseDto } from '../../tax-types/dto/tax-type-response.dto';
import { CurrencyCode } from 'src/common/enums/currency-code.enum';

export class TaxResponseDto {
  id: number;
  taxTypeId: number;
  value: number;
  isPercentage: boolean;
  currency?: CurrencyCode;

  createdAt: Date;
  updatedAt: Date;

  taxType?: TaxTypeResponseDto;

  constructor(entity: TaxEntity) {
    this.id = entity.id;
    this.taxTypeId = entity.taxTypeId;
    this.value = Number(entity.value);
    this.isPercentage = entity.isPercentage;
    this.currency = entity.currency;

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;

    /*if (entity.taxType) {
      this.taxType = new TaxTypeResponseDto(entity.taxType);
    }*/
  }
}