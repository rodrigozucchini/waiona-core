import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { OrdersController } from './orders.controller';
import { OrdersService } from '../services/orders.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { OrderStatus } from '../enums/order-status.enum';
import { DeliveryType } from '../enums/delivery-type.enum';
import { RoleType } from 'src/common/enums/role-type.enum';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: jest.Mocked<OrdersService>;

  const mockService    = () => ({ create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(), findByUser: jest.fn(), updateStatus: jest.fn() });
  const mockAuthGuard  = { canActivate: jest.fn(() => true) };
  const mockRolesGuard = { canActivate: jest.fn(() => true) };

  const mockOrder = (overrides = {}) => ({
    id: 1, status: OrderStatus.PENDING, subtotal: 653.4, total: 653.4,
    deliveryType: DeliveryType.PICKUP, items: [], createdAt: new Date(), updatedAt: new Date(), ...overrides,
  });

  const mockRequest = (sub: number, role = RoleType.CLIENT) =>
    ({ user: { sub, role } }) as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useFactory: mockService },
        { provide: Reflector, useValue: { get: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard('jwt')).useValue(mockAuthGuard)
      .overrideGuard(RolesGuard).useValue(mockRolesGuard)
      .compile();

    controller = module.get<OrdersController>(OrdersController);
    service    = module.get(OrdersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => expect(controller).toBeDefined());

  // ==========================
  // create
  // ==========================

  describe('create', () => {
    it('should create an order for the authenticated user', async () => {
      const dto = { items: [{ productId: 1, quantity: 1 }], deliveryType: DeliveryType.PICKUP };
      service.create.mockResolvedValue(mockOrder() as any);

      const result = await controller.create(mockRequest(1), dto as any);

      expect(service.create).toHaveBeenCalledWith(1, dto);
      expect(result.status).toBe(OrderStatus.PENDING);
    });
  });

  // ==========================
  // findAll
  // ==========================

  describe('findAll', () => {
    it('should return all orders', async () => {
      service.findAll.mockResolvedValue([mockOrder() as any]);
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  // ==========================
  // findByUser
  // ==========================

  describe('findByUser', () => {
    it('should return own orders for client', async () => {
      service.findByUser.mockResolvedValue([mockOrder() as any]);
      const result = await controller.findByUser(1, mockRequest(1, RoleType.CLIENT));
      expect(service.findByUser).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(1);
    });

    it('should throw ForbiddenException if client accesses another user orders', async () => {
      await expect(
        controller.findByUser(2, mockRequest(1, RoleType.CLIENT)),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to access any user orders', async () => {
      service.findByUser.mockResolvedValue([mockOrder() as any]);
      const result = await controller.findByUser(5, mockRequest(1, RoleType.ADMIN));
      expect(service.findByUser).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(1);
    });
  });

  // ==========================
  // findOne
  // ==========================

  describe('findOne', () => {
    it('should return an order by id', async () => {
      service.findOne.mockResolvedValue(mockOrder() as any);
      const result = await controller.findOne(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
    });
  });

  // ==========================
  // updateStatus
  // ==========================

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const dto     = { status: OrderStatus.CONFIRMED };
      const updated = mockOrder({ status: OrderStatus.CONFIRMED });
      service.updateStatus.mockResolvedValue(updated as any);

      const result = await controller.updateStatus(1, dto as any);

      expect(service.updateStatus).toHaveBeenCalledWith(1, dto);
      expect(result.status).toBe(OrderStatus.CONFIRMED);
    });
  });
});