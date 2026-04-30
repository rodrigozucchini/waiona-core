import { Test, TestingModule } from '@nestjs/testing';
import { CouponUsageController } from '../../../coupons/usage/controllers/coupon-usage.controller';
import { CouponUsageService } from '../../../coupons/usage/services/coupon-usage.service';

describe('CouponUsageController', () => {
  let controller: CouponUsageController;
  let service: jest.Mocked<CouponUsageService>;

  const mockService  = () => ({ create: jest.fn(), findAll: jest.fn(), findByCoupon: jest.fn(), findByUser: jest.fn() });
  const mockResponse = (overrides = {}) => ({ id: 1, couponId: 1, orderId: 1, userId: 1, appliedAt: new Date(), createdAt: new Date(), updatedAt: new Date(), ...overrides });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponUsageController],
      providers: [{ provide: CouponUsageService, useFactory: mockService }],
    }).compile();

    controller = module.get<CouponUsageController>(CouponUsageController);
    service    = module.get(CouponUsageService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => expect(controller).toBeDefined());

  it('create should delegate to service', async () => {
    const dto = { code: 'DESCUENTO10', orderId: 1, userId: 1 };
    service.create.mockResolvedValue(mockResponse() as any);
    const result = await controller.create(dto as any);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result.couponId).toBe(1);
  });

  it('findAll should return all usages', async () => {
    service.findAll.mockResolvedValue([mockResponse() as any]);
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('findByCoupon should delegate to service', async () => {
    service.findByCoupon.mockResolvedValue([mockResponse() as any]);
    const result = await controller.findByCoupon(1);
    expect(service.findByCoupon).toHaveBeenCalledWith(1);
    expect(result).toHaveLength(1);
  });

  it('findByUser should delegate to service', async () => {
    service.findByUser.mockResolvedValue([mockResponse() as any]);
    const result = await controller.findByUser(1);
    expect(service.findByUser).toHaveBeenCalledWith(1);
    expect(result).toHaveLength(1);
  });
});