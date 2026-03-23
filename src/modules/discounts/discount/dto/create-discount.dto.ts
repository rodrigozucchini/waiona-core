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

  // Requerido si es monto fijo, y NO debe venir si es porcentaje
  @ValidateIf((o) => o.isPercentage === false)
  @IsEnum(CurrencyCode)
  currency?: CurrencyCode;

  // ==========================
  // DATES
  // ==========================

  // Usando @Type(() => Date) + @IsDate() para consistencia de tipos
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startsAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endsAt?: Date;
}