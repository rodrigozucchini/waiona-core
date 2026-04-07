import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateProductTaxDto {

  @IsOptional()
  @IsInt()
  @Min(1)
  taxId?: number;
}