import { TaxTypeEntity } from '../entities/tax-types.entity';

export class TaxTypeResponseDto {
  id: number;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: TaxTypeEntity): TaxTypeResponseDto {
    return {
      id: entity.id,
      code: entity.code,
      name: entity.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}