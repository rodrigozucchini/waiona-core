import { IsInt, IsOptional } from 'class-validator';

export class UpdateDiscountComboTargetDto {

  @IsOptional()
  @IsInt()
  discountId?: number;

  @IsOptional()
  @IsInt()
  comboId?: number;

}