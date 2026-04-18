import { IsInt, Min } from 'class-validator';

export class CreateDiscountComboTargetDto {

  @IsInt()
  @Min(1)
  comboId: number;
}