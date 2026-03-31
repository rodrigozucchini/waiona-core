import { IsInt, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { CurrencyCode } from 'src/common/enums/currency-code.enum';

export class UpdateComboPricingDto {

  @IsOptional()
  @IsInt()
  @Min(1)
  comboId?: number;

  @IsOptional()
  @IsEnum(CurrencyCode)
  currency?: CurrencyCode;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice?: number;

  // ==========================
  // Margen
  // ==========================

  @IsOptional()
  @IsInt()
  @Min(1)
  marginId?: number;
}