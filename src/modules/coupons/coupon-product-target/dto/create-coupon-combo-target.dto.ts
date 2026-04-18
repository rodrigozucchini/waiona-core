import { IsInt, Min } from 'class-validator';

export class CreateCouponProductTargetDto {

  @IsInt()
  @Min(1)
  productId: number;
}