import { IsInt, IsNumber, IsBoolean, Min } from 'class-validator';

export class CreateTaxDto {

  @IsInt()
  @Min(1)
  taxTypeId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  value: number;

  @IsBoolean()
  isPercentage: boolean;

}