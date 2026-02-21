import { TaxTypeEntity } from '../entities/tax-types.entity';

export class TaxTypeResponseDto {
  id: number;
  code: string;
  name: string;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: TaxTypeEntity) {
    this.id = entity.id;
    this.code = entity.code;
    this.name = entity.name;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}