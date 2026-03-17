import { IsString, IsOptional, MaxLength, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMarginDto {

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'value must be a number with max 2 decimal places' },
  )
  value?: number;

  @IsOptional()
  @IsBoolean()
  isPercentage?: boolean;
}