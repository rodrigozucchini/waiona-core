import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateComboTaxDto {

  @IsOptional()
  @IsInt()
  @Min(1)
  taxId?: number;
}