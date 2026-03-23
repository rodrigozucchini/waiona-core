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
  IsEmpty,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CurrencyCode } from 'src/common/enums/currency-code.enum';

export class UpdateDiscountDto {

  // ==========================
  // BASIC INFO
  // ==========================

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  description?: string;

  // ==========================
  // VALUE
  // ==========================

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999)
  value?: number;

  @IsOptional()
  @IsBoolean()
  isPercentage?: boolean;

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