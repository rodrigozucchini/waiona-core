import { IsInt, Min } from 'class-validator';

export class CreateDiscountProductTargetDto {

  @IsInt()
  @Min(1)
  productId: number;
}