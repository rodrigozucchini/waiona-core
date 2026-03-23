import { IsInt, Min } from 'class-validator';

export class CreateCouponCategoryTargetDto {

  @IsInt()
  @Min(1)
  categoryId: number;
}