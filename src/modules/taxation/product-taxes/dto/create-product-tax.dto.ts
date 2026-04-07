import { IsInt, Min } from 'class-validator';

export class CreateProductTaxDto {

  @IsInt()
  @Min(1)
  taxId: number;
}