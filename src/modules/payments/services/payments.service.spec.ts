import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { PaymentsService } from './payments.service';
import { PaymentEntity } from '../entities/payment.entity';
import { OrderEntity } from 'src/modules/orders/entities/order.entity';
import { MercadoPagoProvider } from './providers/mercadopago.provider';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { OrderStatus } from 'src/modules/orders/enums/order-status.enum';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const mockPaymentRepo = () => ({ find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() });
  const mockOrderRepo   = () => ({ find: jest.fn(), findOne: jest.fn(), save: jest.fn() });
  const mockMpProvider  = () => ({
    createPreference: jest.fn(),
    getClient:        jest.fn(),
  });

  const mockOrder = (overrides = {}): OrderEntity =>
    ({ id: 1, status: OrderStatus.PENDING, total: 653.4, isDeleted: false,
       items: [], createdAt: new Date(), updatedAt: new Date(), ...overrides }) as unknown as OrderEntity;

  const mockPayment = (overrides = {}): PaymentEntity =>
    ({ id: 1, orderId: 1, provider: PaymentProvider.MERCADOPAGO, status: PaymentStatus.PENDING,
       externalId: 'pref_123', checkoutUrl: 'https://mp.com/checkout', amount: 653.4,
       isDeleted: false, createdAt: new Date(), updatedAt: new Date(), ...overrides }) as unknown as PaymentEntity;

  let paymentRepo: any;
  let orderRepo: any;
  let mpProvider: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(PaymentEntity), useFactory: mockPaymentRepo },
        { provide: getRepositoryToken(OrderEntity),   useFactory: mockOrderRepo   },
        { provide: MercadoPagoProvider,               useFactory: mockMpProvider  },
      ],
    }).compile();

    service     = module.get<PaymentsService>(PaymentsService);
    paymentRepo = module.get(getRepositoryToken(PaymentEntity));
    orderRepo   = module.get(getRepositoryToken(OrderEntity));
    mpProvider  = module.get(MercadoPagoProvider);
  });

  afterEach(() => jest.clearAllMocks());

  // ==========================
  // create
  // ==========================

  describe('create', () => {
    const dto = { orderId: 1, provider: PaymentProvider.MERCADOPAGO };

    it('should create a payment with MercadoPago preference', async () => {
      const payment = mockPayment();
      orderRepo.findOne.mockResolvedValue(mockOrder());
      paymentRepo.findOne.mockResolvedValue(null); // no hay pago pendiente
      mpProvider.createPreference.mockResolvedValue({ id: 'pref_123', checkoutUrl: 'https://mp.com/checkout' });
      paymentRepo.create.mockReturnValue(payment);
      paymentRepo.save.mockResolvedValue(payment);

      const result = await service.create(dto as any);

      expect(mpProvider.createPreference).toHaveBeenCalled();
      expect(result.status).toBe(PaymentStatus.PENDING);
      expect(result.checkoutUrl).toBe('https://mp.com/checkout');
    });

    it('should throw NotFoundException if order not found', async () => {
      orderRepo.findOne.mockResolvedValue(null);
      await expect(service.create(dto as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if order is not PENDING', async () => {
      orderRepo.findOne.mockResolvedValue(mockOrder({ status: OrderStatus.CONFIRMED }));
      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if order already has a pending payment', async () => {
      orderRepo.findOne.mockResolvedValue(mockOrder());
      paymentRepo.findOne.mockResolvedValue(mockPayment());
      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    });
  });

  // ==========================
  // handleMercadoPagoWebhook
  // ==========================

  describe('handleMercadoPagoWebhook', () => {
    const mockMerchantOrderGet = jest.fn();

    beforeEach(() => {
      jest.mock('mercadopago', () => ({
        MerchantOrder: jest.fn().mockImplementation(() => ({
          get: mockMerchantOrderGet,
        })),
      }));
    });

    it('should return early if no id in query or body', async () => {
      await service.handleMercadoPagoWebhook({}, {});
      expect(paymentRepo.findOne).not.toHaveBeenCalled();
    });

    it('should return early if topic is not payment or merchant_order', async () => {
      await service.handleMercadoPagoWebhook({}, { id: '1', topic: 'other' });
      expect(paymentRepo.findOne).not.toHaveBeenCalled();
    });

    it('should swallow errors silently', async () => {
      mpProvider.getClient.mockReturnValue({});
      // MerchantOrder.get va a fallar porque está mockeado globalmente
      // el service debe tragarse el error sin tirar
      await expect(
        service.handleMercadoPagoWebhook({}, { id: '1', topic: 'payment' }),
      ).resolves.not.toThrow();
    });
  });

  // ==========================
  // findByOrder
  // ==========================

  describe('findByOrder', () => {
    it('should return payments by orderId', async () => {
      paymentRepo.find.mockResolvedValue([mockPayment()]);
      const result = await service.findByOrder(1);
      expect(result).toHaveLength(1);
      expect(result[0].orderId).toBe(1);
    });

    it('should return empty array if no payments', async () => {
      paymentRepo.find.mockResolvedValue([]);
      const result = await service.findByOrder(999);
      expect(result).toEqual([]);
    });
  });

  // ==========================
  // findOne
  // ==========================

  describe('findOne', () => {
    it('should return a payment by id', async () => {
      paymentRepo.findOne.mockResolvedValue(mockPayment());
      const result = await service.findOne(1);
      expect(result.id).toBe(1);
      expect(result.status).toBe(PaymentStatus.PENDING);
    });

    it('should throw NotFoundException if not found', async () => {
      paymentRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});