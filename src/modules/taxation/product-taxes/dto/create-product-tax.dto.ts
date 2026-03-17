import { IsInt } from 'class-validator';

export class CreateProductTaxDto {

  @IsInt()
  productId: number;

  @IsInt()
  taxId: number;

}