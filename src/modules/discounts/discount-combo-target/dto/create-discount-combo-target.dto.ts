import { IsInt } from 'class-validator';

export class CreateDiscountComboTargetDto {

  @IsInt()
  discountId: number;

  @IsInt()
  comboId: number;

}