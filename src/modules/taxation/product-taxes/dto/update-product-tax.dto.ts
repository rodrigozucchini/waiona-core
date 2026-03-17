import { IsInt, IsOptional } from 'class-validator';

export class UpdateProductTaxDto {

  @IsOptional()
  @IsInt()
  productId?: number;

  @IsOptional()
  @IsInt()
  taxId?: number;

}