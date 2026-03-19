import { IsInt } from 'class-validator';

export class CreateCategoryTaxDto {

  @IsInt()
  categoryId: number;

  @IsInt()
  taxId: number;

}