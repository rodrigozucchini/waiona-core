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

  // currency es requerida si isPercentage viene explícitamente como false,
  // e inválida si isPercentage viene como true.
  // Si isPercentage no viene, currency es opcional (lógica de negocio en el service).
  @ValidateIf((o) => o.isPercentage === false)
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