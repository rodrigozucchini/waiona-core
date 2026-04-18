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
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CurrencyCode } from 'src/common/enums/currency-code.enum';

export class UpdateCouponDto {

  // ==========================
  // BASIC INFO
  // ==========================

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  code?: string;

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
  // ALCANCE
  // ==========================

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  // ==========================
  // USO
  // ==========================

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

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