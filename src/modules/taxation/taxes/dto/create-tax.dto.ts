import { IsNumber, IsBoolean, Min, IsOptional, IsEnum } from 'class-validator';
import { CurrencyCode } from 'src/common/enums/currency-code.enum';

export class CreateTaxDto {

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  value: number;

  @IsBoolean()
  isPercentage: boolean;

  @IsOptional()
  @IsEnum(CurrencyCode)
  currency?: CurrencyCode;

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;
}