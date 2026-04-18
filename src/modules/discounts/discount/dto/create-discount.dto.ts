import {
  IsString,
  MaxLength,
  MinLength,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CurrencyCode } from 'src/common/enums/currency-code.enum';

export class CreateDiscountDto {

  // ==========================
  // BASIC INFO
  // ==========================

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  description?: string;

  // ==========================
  // VALUE
  // ==========================

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999)
  value: number;

  @IsBoolean()
  isPercentage: boolean;

  @IsOptional()
  @IsEnum(CurrencyCode)
  currency?: CurrencyCode;

  // ==========================
  // DATES
  // ==========================

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startsAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endsAt?: Date;
}