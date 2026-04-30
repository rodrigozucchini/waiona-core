import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CouponUsageService } from '../../../coupons/usage/services/coupon-usage.service';
import { CouponUsageEntity } from '../../../coupons/usage/entities/coupon-usage.entity';
import { CouponEntity } from '../../../coupons/coupon/entities/coupon.entity';

describe('CouponUsageService', () => {
  let service: CouponUsageService;

  const mockUsageRepo  = () => ({ find: jest.fn(), findOne: jest.fn() });
  const mockCouponRepo = () => ({ findOne: jest.fn(), save: jest.fn() });

  const mockEntityManager = { create: jest.fn(), save: jest.fn() };
  const mockDataSource    = { transaction: jest.fn(cb => cb(mockEntityManager)) };

  const mockCoupon = (overrides = {}): CouponEntity =>
    ({ id: 1, code: 'DESCUENTO10', usageLimit: 100, usageCount: 0,
       startsAt: null, endsAt: null, isDeleted: false, ...overrides }) as unknown as CouponEntity;

  const mockUsage = (overrides = {}) =>
    ({ id: 1, couponId: 1, orderId: 1, userId: 1, appliedAt: new Date(),
       createdAt: new Date(), updatedAt: new Date(), ...overrides });

  let usageRepo: any;
  let couponRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponUsageService,
        { provide: getRepositoryToken(CouponUsageEntity), useFactory: mockUsageRepo  },
        { provide: getRepositoryToken(CouponEntity),      useFactory: mockCouponRepo },
        { provide: DataSource,                            useValue: mockDataSource   },
      ],
    }).compile();

    service    = module.get<CouponUsageService>(CouponUsageService);
    usageRepo  = module.get(getRepositoryToken(CouponUsageEntity));
    couponRepo = module.get(getRepositoryToken(CouponEntity));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    const dto = { code: 'DESCUENTO10', orderId: 1, userId: 1 };

    it('should create a usage and increment usageCount in transaction', async () => {
      const usage = mockUsage();
      couponRepo.findOne.mockResolvedValue(mockCoupon());
      usageRepo.findOne.mockResolvedValue(null); // no usado antes
      mockEntityManager.create.mockReturnValue(usage);
      mockEntityManager.save.mockResolvedValue(usage);

      const result = await service.create(dto as any);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(result.couponId).toBe(1);
    });

    it('should throw NotFoundException if coupon not found', async () => {
      couponRepo.findOne.mockResolvedValue(null);
      await expect(service.create(dto as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if coupon not active yet', async () => {
      const future = new Date(Date.now() + 100000);
      couponRepo.findOne.mockResolvedValue(mockCoupon({ startsAt: future }));
      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if coupon expired', async () => {
      const past = new Date(Date.now() - 1000);
      couponRepo.findOne.mockResolvedValue(mockCoupon({ endsAt: past }));
      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if usage limit reached', async () => {
      couponRepo.findOne.mockResolvedValue(mockCoupon({ usageLimit: 5, usageCount: 5 }));
      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if user already used the coupon', async () => {
      couponRepo.findOne.mockResolvedValue(mockCoupon());
      usageRepo.findOne.mockResolvedValue(mockUsage());
      await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all usages', async () => {
      usageRepo.find.mockResolvedValue([mockUsage()]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('findByCoupon', () => {
    it('should return usages by couponId', async () => {
      usageRepo.find.mockResolvedValue([mockUsage()]);
      const result = await service.findByCoupon(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('findByUser', () => {
    it('should return usages by userId', async () => {
      usageRepo.find.mockResolvedValue([mockUsage()]);
      const result = await service.findByUser(1);
      expect(result).toHaveLength(1);
    });
  });
});