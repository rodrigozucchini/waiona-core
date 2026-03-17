import { IsInt, IsOptional } from 'class-validator';

export class UpdateDiscountProductTargetDto {

  @IsOptional()
  @IsInt()
  discountId?: number;

  @IsOptional()
  @IsInt()
  productId?: number;

}