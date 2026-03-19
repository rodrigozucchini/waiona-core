import { IsInt, IsEnum, IsNumber } from 'class-validator';
import { CurrencyCode } from 'src/common/enums/currency-code.enum';

export class CreateComboPricingDto {

  @IsInt()
  comboId: number;

  @IsEnum(CurrencyCode)
  currency: CurrencyCode;

  @IsNumber()
  unitPrice: number;

}