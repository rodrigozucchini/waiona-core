import { IsInt, Min } from 'class-validator';

export class CreateDiscountCategoryTargetDto {

  @IsInt()
  @Min(1)
  categoryId: number;
}