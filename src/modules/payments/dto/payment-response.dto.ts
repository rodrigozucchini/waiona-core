import { PaymentEntity } from '../entities/payment.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentProvider } from '../enums/payment-provider.enum';

export class PaymentResponseDto {
  id: number;
  orderId: number;
  provider: PaymentProvider;
  status: PaymentStatus;
  externalId?: string | null;
  checkoutUrl?: string | null;
  amount: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: PaymentEntity) {
    this.id = entity.id;
    this.orderId = entity.orderId;
    this.provider = entity.provider;
    this.status = entity.status;
    this.externalId = entity.externalId;
    this.checkoutUrl = entity.checkoutUrl;
    this.amount = entity.amount;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}