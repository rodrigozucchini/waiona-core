import { IsInt, IsOptional } from 'class-validator';

export class UpdateComboTaxDto {

  @IsOptional()
  @IsInt()
  comboId?: number;

  @IsOptional()
  @IsInt()
  taxId?: number;

}