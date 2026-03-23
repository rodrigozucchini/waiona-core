import {
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsDate,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CurrencyCode } from 'src/common/enums/currency-code.enum';

export class CreateCouponDto {

  // ==========================
  // BASIC INFO
  // ==========================

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  code: string;

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
  // ALCANCE
  // ==========================

  @IsBoolean()
  isGlobal: boolean;

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