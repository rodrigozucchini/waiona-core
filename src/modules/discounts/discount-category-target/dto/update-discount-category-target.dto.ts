import { IsInt, IsOptional } from 'class-validator';

export class UpdateDiscountCategoryTargetDto {

  @IsOptional()
  @IsInt()
  discountId?: number;

  @IsOptional()
  @IsInt()
  categoryId?: number;

}