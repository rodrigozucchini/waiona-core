import { IsInt } from 'class-validator';

export class CreateComboTaxDto {

  @IsInt()
  comboId: number;

  @IsInt()
  taxId: number;

}