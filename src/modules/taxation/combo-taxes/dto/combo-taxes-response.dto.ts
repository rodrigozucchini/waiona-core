import { ComboTaxEntity } from "../entities/combo.-taxes.entity";

export class ComboTaxResponseDto {

  id: number;
  comboId: number;
  taxId: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: ComboTaxEntity) {
    this.id = entity.id;
    this.comboId = entity.comboId;
    this.taxId = entity.taxId;

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }

}