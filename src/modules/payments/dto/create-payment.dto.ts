import { IsEnum, IsInt, Min } from 'class-validator';
import { PaymentProvider } from '../enums/payment-provider.enum';

export class CreatePaymentDto {

  @IsInt()
  @Min(1)
  orderId: number;

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;
}