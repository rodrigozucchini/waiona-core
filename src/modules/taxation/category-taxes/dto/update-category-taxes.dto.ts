import { IsInt, IsOptional } from 'class-validator';

export class UpdateCategoryTaxDto {

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsInt()
  taxId?: number;

}