import { IsString, IsNotEmpty, MaxLength, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMarginDto {
  
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'value must be a number with max 2 decimal places' },
  )
  value: number;

  @IsBoolean()
  isPercentage: boolean;
}