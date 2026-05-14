import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { PaymentEntity } from '../entities/payment.entity';
import { OrderEntity } from 'src/modules/orders/entities/order.entity';
import { MercadoPagoProvider } from './providers/mercadopago.provider';
import { MerchantOrder, Payment } from 'mercadopago';

import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';

import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { OrderStatus } from 'src/modules/orders/enums/order-status.enum';
import { RoleType } from 'src/common/enums/role-type.enum';

@Injectable()
export class PaymentsService {

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,

    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,

    private readonly mercadoPagoProvider: MercadoPagoProvider,
    private readonly dataSource: DataSource,
  ) {}

  // ==========================
  // CREATE PAYMENT
  // ==========================

  async create(userId: number, role: RoleType, dto: CreatePaymentDto): Promise<PaymentResponseDto> {

    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId, isDeleted: false },
      relations: ['items', 'items.product', 'items.combo', 'user'],
    });

    if (!order) throw new NotFoundException('Order not found');

    if (role === RoleType.CLIENT && order.user.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not in a payable state');
    }

    const existingPayment = await this.paymentRepo.findOne({
      where: { orderId: dto.orderId, status: PaymentStatus.PENDING },
    });

    if (existingPayment) {
      throw new BadRequestException('Order already has a pending payment');
    }

    let externalId: string | null = null;
    let checkoutUrl: string | null = null;

    if (dto.provider === PaymentProvider.MERCADOPAGO) {
      const preference = await this.mercadoPagoProvider.createPreference(order);
      externalId = preference.id;
      checkoutUrl = preference.checkoutUrl;
    }

    const payment = this.paymentRepo.create({
      orderId: dto.orderId,
      provider: dto.provider,
      status: PaymentStatus.PENDING,
      externalId,
      checkoutUrl,
      amount: order.total,
    });

    const saved = await this.paymentRepo.save(payment);
    return new PaymentResponseDto(saved);
  }

  // ==========================
  // WEBHOOK MERCADOPAGO
  // ==========================

  async handleMercadoPagoWebhook(body: any, query: any): Promise<void> {

    const topic = query.topic ?? body.type;
    const id    = query.id ?? body.data?.id;

    if (!id) return;
    if (topic !== 'payment' && topic !== 'merchant_order') return;

    try {
      let externalReference: string | null | undefined;
      let mpStatus: string | null | undefined;

      if (topic === 'payment') {
        // topic=payment → usar Payment API para obtener la info del pago
        const mpPayment = new Payment(this.mercadoPagoProvider.getClient());
        const paymentData = await mpPayment.get({ id: String(id) });
        externalReference = paymentData.external_reference;
        // mapear status de Payment al mismo vocabulario que MerchantOrder
        const s = paymentData.status;
        if (s === 'approved') mpStatus = 'paid';
        else if (s === 'refunded' || s === 'charged_back') mpStatus = 'reverted';
        else if (s === 'in_process' || s === 'pending') mpStatus = 'payment_in_process';
        else mpStatus = 'expired';
      } else {
        // topic=merchant_order → usar MerchantOrder API
        const merchantOrder = new MerchantOrder(this.mercadoPagoProvider.getClient());
        const mpOrder = await merchantOrder.get({ merchantOrderId: Number(id) });
        externalReference = mpOrder.external_reference;
        mpStatus = mpOrder.order_status;
      }

      if (!externalReference) return;

      const payment = await this.paymentRepo.findOne({
        where: { orderId: Number(externalReference) },
        relations: ['order'],
      });

      if (!payment) return;

      // 🔥 manejar todos los status posibles de MP
      if (mpStatus === 'paid') {
        payment.status         = PaymentStatus.APPROVED;
        payment.order.status   = OrderStatus.CONFIRMED;
      } else if (mpStatus === 'reverted' || mpStatus === 'charged_back') {
        payment.status         = PaymentStatus.CANCELLED;
        payment.order.status   = OrderStatus.CANCELLED;
      } else if (mpStatus === 'payment_required' || mpStatus === 'payment_in_process') {
        payment.status = PaymentStatus.PENDING;
        // orden se mantiene en PENDING
      } else {
        // expired u otros → rechazado
        payment.status       = PaymentStatus.REJECTED;
        payment.order.status = OrderStatus.CANCELLED;
      }

      payment.metadata = { body, query };

      // 🔥 transacción — si falla uno, ambos se revierten
      await this.dataSource.transaction(async manager => {
        await manager.save(payment.order);
        await manager.save(payment);
      });

    } catch {
      // swallow — MP requiere siempre 200
    }
  }

  // ==========================
  // FIND BY ORDER
  // ==========================

  async findByOrder(orderId: number, userId: number, role: RoleType): Promise<PaymentResponseDto[]> {
    if (role === RoleType.CLIENT) {
      const order = await this.orderRepo.findOne({
        where: { id: orderId, isDeleted: false },
        relations: ['user'],
      });
      if (!order) throw new NotFoundException('Order not found');
      if (order.user.id !== userId) throw new ForbiddenException('Access denied');
    }

    const payments = await this.paymentRepo.find({
      where: { orderId, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
    return payments.map(p => new PaymentResponseDto(p));
  }

  // ==========================
  // FIND ONE
  // ==========================

  async findOne(id: number, userId: number, role: RoleType): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepo.findOne({
      where: { id, isDeleted: false },
      relations: role === RoleType.CLIENT ? ['order', 'order.user'] : [],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (role === RoleType.CLIENT && payment.order.user.id !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return new PaymentResponseDto(payment);
  }
}