import { IsInt } from 'class-validator';

export class CreateDiscountProductTargetDto {

  @IsInt()
  discountId: number;

  @IsInt()
  productId: number;

}