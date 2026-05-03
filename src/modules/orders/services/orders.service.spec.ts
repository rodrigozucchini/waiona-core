import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

import { OrdersService } from './orders.service';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { ProductEntity } from 'src/modules/products/product/entities/product.entity';
import { ComboEntity } from 'src/modules/products/combos/entities/combo.entity';
import { CouponEntity } from 'src/modules/coupons/coupon/entities/coupon.entity';
import { CouponUsageEntity } from 'src/modules/coupons/usage/entities/coupon-usage.entity';
import { StockItemEntity } from 'src/modules/stocks/stock-item/entities/stock-item.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { StockItemsService } from 'src/modules/stocks/stock-item/services/stock-item.service';
import { CalculationService } from 'src/modules/pricing/calculation/services/calculation.service';
import { OrderStatus } from '../enums/order-status.enum';
import { DeliveryType } from '../enums/delivery-type.enum';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockOrderRepo       = () => ({ find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() });
  const mockOrderItemRepo   = () => ({ create: jest.fn() });
  const mockProductRepo     = () => ({ findOne: jest.fn() });
  const mockComboRepo       = () => ({ findOne: jest.fn() });
  const mockCouponRepo      = () => ({ findOne: jest.fn(), save: jest.fn() });
  const mockCouponUsageRepo = () => ({ findOne: jest.fn(), create: jest.fn(), save: jest.fn() });
  const mockStockItemRepo   = () => ({ findOne: jest.fn() });
  const mockUserRepo        = () => ({ findOne: jest.fn() });
  const mockStockService    = () => ({ reserveStock: jest.fn(), dispatchStock: jest.fn(), releaseReservation: jest.fn() });
  const mockCalcService     = () => ({ calculateProduct: jest.fn(), calculateCombo: jest.fn() });

  const mockEntityManager = { create: jest.fn(), save: jest.fn() };
  const mockDataSource    = { transaction: jest.fn(cb => cb(mockEntityManager)) };

  const mockUser    = (overrides = {}) => ({ id: 1, email: 'juan@test.com', isDeleted: false, ...overrides });
  const mockProduct = (overrides = {}) => ({ id: 1, name: 'Coca Cola 500ml', isDeleted: false, ...overrides });
  const mockStock   = (overrides = {}) => ({ id: 1, productId: 1, locationId: 1, quantityCurrent: 10, quantityReserved: 2, isDeleted: false, ...overrides });
  const mockBreakdown = (overrides = {}) => ({ unitPrice: 500, discount: 0, finalPrice: 653.4, fullPrice: 726, coupon: 0, orderTotal: 653.4, ...overrides });
  const mockOrder   = (overrides = {}): OrderEntity =>
    ({ id: 1, status: OrderStatus.PENDING, subtotal: 653.4, total: 653.4, isDeleted: false,
       items: [{ id: 1, quantity: 1, product: mockProduct(), combo: null }],
       createdAt: new Date(), updatedAt: new Date(), ...overrides }) as unknown as OrderEntity;

  let orderRepo: any;
  let productRepo: any;
  let stockItemRepo: any;
  let userRepo: any;
  let couponRepo: any;
  let couponUsageRepo: any;
  let stockService: any;
  let calcService: any;
  let orderItemRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(OrderEntity),       useFactory: mockOrderRepo       },
        { provide: getRepositoryToken(OrderItemEntity),   useFactory: mockOrderItemRepo   },
        { provide: getRepositoryToken(ProductEntity),     useFactory: mockProductRepo     },
        { provide: getRepositoryToken(ComboEntity),       useFactory: mockComboRepo       },
        { provide: getRepositoryToken(CouponEntity),      useFactory: mockCouponRepo      },
        { provide: getRepositoryToken(CouponUsageEntity), useFactory: mockCouponUsageRepo },
        { provide: getRepositoryToken(StockItemEntity),   useFactory: mockStockItemRepo   },
        { provide: getRepositoryToken(UserEntity),        useFactory: mockUserRepo        },
        { provide: StockItemsService,                     useFactory: mockStockService    },
        { provide: CalculationService,                    useFactory: mockCalcService     },
        { provide: DataSource,                            useValue: mockDataSource        },
      ],
    }).compile();

    service         = module.get<OrdersService>(OrdersService);
    orderRepo       = module.get(getRepositoryToken(OrderEntity));
    productRepo     = module.get(getRepositoryToken(ProductEntity));
    stockItemRepo   = module.get(getRepositoryToken(StockItemEntity));
    userRepo        = module.get(getRepositoryToken(UserEntity));
    couponRepo      = module.get(getRepositoryToken(CouponEntity));
    couponUsageRepo = module.get(getRepositoryToken(CouponUsageEntity));
    stockService    = module.get(StockItemsService);
    calcService     = module.get(CalculationService);
    orderItemRepo   = module.get(getRepositoryToken(OrderItemEntity));
  });

  afterEach(() => jest.clearAllMocks());

  // ==========================
  // create
  // ==========================

  describe('create', () => {
    const dto = {
      items: [{ productId: 1, quantity: 2 }],
      deliveryType: DeliveryType.PICKUP,
    };

    it('should create an order with product in transaction', async () => {
      const order = mockOrder();
      userRepo.findOne.mockResolvedValue(mockUser());
      productRepo.findOne.mockResolvedValue(mockProduct());
      stockItemRepo.findOne.mockResolvedValue(mockStock());
      calcService.calculateProduct.mockResolvedValue(mockBreakdown());
      orderItemRepo.create.mockReturnValue({});
      mockEntityManager.create.mockReturnValue(order);
      mockEntityManager.save.mockResolvedValue(order);
      stockService.reserveStock.mockResolvedValue(undefined);

      const result = await service.create(1, dto as any);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(stockService.reserveStock).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.create(99, dto as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if item has no productId or comboId', async () => {
      userRepo.findOne.mockResolvedValue(mockUser());
      await expect(service.create(1, { items: [{ quantity: 1 }], deliveryType: DeliveryType.PICKUP } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if item has both productId and comboId', async () => {
      userRepo.findOne.mockResolvedValue(mockUser());
      await expect(service.create(1, { items: [{ productId: 1, comboId: 1, quantity: 1 }], deliveryType: DeliveryType.PICKUP } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if delivery without address', async () => {
      userRepo.findOne.mockResolvedValue(mockUser());
      await expect(service.create(1, { items: [{ productId: 1, quantity: 1 }], deliveryType: DeliveryType.DELIVERY } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if product not found', async () => {
      userRepo.findOne.mockResolvedValue(mockUser());
      productRepo.findOne.mockResolvedValue(null);
      await expect(service.create(1, dto as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      userRepo.findOne.mockResolvedValue(mockUser());
      productRepo.findOne.mockResolvedValue(mockProduct());
      stockItemRepo.findOne.mockResolvedValue(mockStock({ quantityCurrent: 2, quantityReserved: 1 }));
      calcService.calculateProduct.mockResolvedValue(mockBreakdown());
      await expect(service.create(1, { items: [{ productId: 1, quantity: 5 }], deliveryType: DeliveryType.PICKUP } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if coupon already used by user', async () => {
      userRepo.findOne.mockResolvedValue(mockUser());
      productRepo.findOne.mockResolvedValue(mockProduct());
      stockItemRepo.findOne.mockResolvedValue(mockStock());
      calcService.calculateProduct.mockResolvedValue(mockBreakdown());
      orderItemRepo.create.mockReturnValue({});
      couponRepo.findOne.mockResolvedValue({ id: 1, code: 'DESC10', usageLimit: null, usageCount: 0, startsAt: null, endsAt: null });
      couponUsageRepo.findOne.mockResolvedValue({ id: 1 }); // ya usó el cupón

      await expect(service.create(1, { ...dto, couponCode: 'DESC10' } as any)).rejects.toThrow(ConflictException);
    });
  });

  // ==========================
  // findAll
  // ==========================

  describe('findAll', () => {
    it('should return all orders', async () => {
      orderRepo.find.mockResolvedValue([mockOrder()]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });

    it('should return empty array', async () => {
      orderRepo.find.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ==========================
  // findOne
  // ==========================

  describe('findOne', () => {
    it('should return an order by id', async () => {
      orderRepo.findOne.mockResolvedValue(mockOrder());
      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException', async () => {
      orderRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================
  // findByUser
  // ==========================

  describe('findByUser', () => {
    it('should return orders for a user', async () => {
      orderRepo.find.mockResolvedValue([mockOrder()]);
      const result = await service.findByUser(1);
      expect(result).toHaveLength(1);
    });
  });

  // ==========================
  // updateStatus
  // ==========================

  describe('updateStatus', () => {
    it('should confirm a pending order', async () => {
      const order   = mockOrder();
      const updated = mockOrder({ status: OrderStatus.CONFIRMED });
      orderRepo.findOne.mockResolvedValue(order);
      orderRepo.save.mockResolvedValue(updated);

      const result = await service.updateStatus(1, { status: OrderStatus.CONFIRMED } as any);
      expect(result.status).toBe(OrderStatus.CONFIRMED);
    });

    it('should throw BadRequestException for invalid transition', async () => {
      orderRepo.findOne.mockResolvedValue(mockOrder({ status: OrderStatus.DELIVERED }));
      await expect(
        service.updateStatus(1, { status: OrderStatus.PENDING } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException from CANCELLED', async () => {
      orderRepo.findOne.mockResolvedValue(mockOrder({ status: OrderStatus.CANCELLED }));
      await expect(
        service.updateStatus(1, { status: OrderStatus.CONFIRMED } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should dispatch stock when status is DISPATCHED', async () => {
      const order = mockOrder({ status: OrderStatus.CONFIRMED });
      orderRepo.findOne.mockResolvedValue(order);
      stockItemRepo.findOne.mockResolvedValue(mockStock());
      stockService.dispatchStock.mockResolvedValue(undefined);
      orderRepo.save.mockResolvedValue(mockOrder({ status: OrderStatus.DISPATCHED }));

      await service.updateStatus(1, { status: OrderStatus.DISPATCHED } as any);
      expect(stockService.dispatchStock).toHaveBeenCalled();
    });

    it('should release stock when status is CANCELLED', async () => {
      const order = mockOrder({ status: OrderStatus.CONFIRMED });
      orderRepo.findOne.mockResolvedValue(order);
      stockItemRepo.findOne.mockResolvedValue(mockStock());
      stockService.releaseReservation.mockResolvedValue(undefined);
      orderRepo.save.mockResolvedValue(mockOrder({ status: OrderStatus.CANCELLED }));

      await service.updateStatus(1, { status: OrderStatus.CANCELLED } as any);
      expect(stockService.releaseReservation).toHaveBeenCalled();
    });

    it('should throw NotFoundException if order not found', async () => {
      orderRepo.findOne.mockResolvedValue(null);
      await expect(service.updateStatus(999, { status: OrderStatus.CONFIRMED } as any)).rejects.toThrow(NotFoundException);
    });
  });
}); 