import { IsInt, IsNumber, IsBoolean, Min, IsOptional, IsEnum } from 'class-validator';
import { CurrencyCode } from 'src/common/enums/currency-code.enum';

export class UpdateTaxDto {

  @IsOptional()
  @IsInt()
  @Min(1)
  taxTypeId?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  value?: number;

  @IsOptional()
  @IsBoolean()
  isPercentage?: boolean;

  @IsOptional()
  @IsEnum(CurrencyCode)
  currency?: CurrencyCode;

}