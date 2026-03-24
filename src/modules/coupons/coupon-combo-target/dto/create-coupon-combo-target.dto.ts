import { IsInt, Min } from 'class-validator';

export class CreateCouponComboTargetDto {

  @IsInt()
  @Min(1)
  comboId: number;
}