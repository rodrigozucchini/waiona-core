import { IsInt } from 'class-validator';

export class CreateDiscountCategoryTargetDto {

  @IsInt()
  discountId: number;

  @IsInt()
  categoryId: number;

}