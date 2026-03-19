import { IsInt, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { CurrencyCode } from 'src/common/enums/currency-code.enum';

export class UpdateComboPricingDto {

  @IsOptional()
  @IsInt()
  comboId?: number;

  @IsOptional()
  @IsEnum(CurrencyCode)
  currency?: CurrencyCode;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

}