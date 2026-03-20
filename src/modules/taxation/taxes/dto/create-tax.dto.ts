import { IsInt, IsNumber, IsBoolean, Min, IsOptional, IsEnum } from 'class-validator';
import { CurrencyCode } from 'src/common/enums/currency-code.enum';

export class CreateTaxDto {

  @IsInt()
  @Min(1)
  taxTypeId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  value: number;

  @IsBoolean()
  isPercentage: boolean;

  @IsOptional()
  @IsEnum(CurrencyCode)
  currency?: CurrencyCode;

}