import { IsInt, Min } from 'class-validator';

export class CreateComboTaxDto {

  @IsInt()
  @Min(1)
  taxId: number;
}