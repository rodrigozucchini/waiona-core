import { IsString, IsNotEmpty, MaxLength, MinLength, IsNumber, IsBoolean, Min, Max, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMarginDto {

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @ValidateIf(o => o.isPercentage === true)
  @Max(100)
  value: number;

  @IsBoolean()
  isPercentage: boolean;
}