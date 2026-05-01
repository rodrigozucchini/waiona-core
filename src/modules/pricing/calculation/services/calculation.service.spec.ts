import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CalculationService } from '../../calculation/services/calculation.service';
import { ProductPricingEntity } from '../../entities/product-pricing.entity';
import { ComboPricingEntity } from '../../entities/combo-pricing.entity';
import { CouponEntity } from 'src/modules/coupons/coupon/entities/coupon.entity';
import { CouponProductTargetEntity } from 'src/modules/coupons/coupon-product-target/entities/coupon-product-target.entity';
import { CouponComboTargetEntity } from 'src/modules/coupons/coupon-combo-target/entities/coupon-combo-target.entity';
import { TaxEntity } from 'src/modules/taxation/taxes/entities/tax.entity';
import { CurrencyCode } from 'src/common/enums/currency-code.enum';

describe('CalculationService', () => {
  let service: CalculationService;

  const mockProductPricingRepo      = () => ({ findOne: jest.fn() });
  const mockComboPricingRepo        = () => ({ findOne: jest.fn() });
  const mockCouponRepo              = () => ({ findOne: jest.fn() });
  const mockCouponProductTargetRepo = () => ({ findOne: jest.fn() });
  const mockCouponComboTargetRepo   = () => ({ findOne: jest.fn() });
  const mockTaxRepo                 = () => ({ find: jest.fn() });

  const mockMargin = { id: 1, value: 20, isPercentage: true };

  const mockProductPricing = (overrides = {}) => ({
    id: 1, productId: 1, currency: CurrencyCode.ARS, unitPrice: 500,
    margin: mockMargin, isDeleted: false, ...overrides,
  });

  const mockComboPricing = (overrides = {}) => ({
    id: 1, comboId: 1, currency: CurrencyCode.ARS, unitPrice: 1200,
    margin: mockMargin, isDeleted: false, ...overrides,
  });

  let productPricingRepo: any;
  let comboPricingRepo: any;
  let couponRepo: any;
  let taxRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculationService,
        { provide: getRepositoryToken(ProductPricingEntity),      useFactory: mockProductPricingRepo      },
        { provide: getRepositoryToken(ComboPricingEntity),        useFactory: mockComboPricingRepo        },
        { provide: getRepositoryToken(CouponEntity),              useFactory: mockCouponRepo              },
        { provide: getRepositoryToken(CouponProductTargetEntity), useFactory: mockCouponProductTargetRepo },
        { provide: getRepositoryToken(CouponComboTargetEntity),   useFactory: mockCouponComboTargetRepo   },
        { provide: getRepositoryToken(TaxEntity),                 useFactory: mockTaxRepo                 },
      ],
    }).compile();

    service            = module.get<CalculationService>(CalculationService);
    productPricingRepo = module.get(getRepositoryToken(ProductPricingEntity));
    comboPricingRepo   = module.get(getRepositoryToken(ComboPricingEntity));
    couponRepo         = module.get(getRepositoryToken(CouponEntity));
    taxRepo            = module.get(getRepositoryToken(TaxEntity));
  });

  afterEach(() => jest.clearAllMocks());

  // ==========================
  // calculateProduct
  // ==========================

  describe('calculateProduct', () => {
    it('should calculate product price correctly', async () => {
      productPricingRepo.findOne.mockResolvedValue(mockProductPricing());
      taxRepo.find.mockResolvedValue([]);

      const result = await service.calculateProduct({ productId: 1 });

      expect(result.unitPrice).toBe(500);
      expect(result.margin).toBeGreaterThan(0);
      expect(result.finalPrice).toBeGreaterThan(result.unitPrice);
      expect(result.fullPrice).toBeGreaterThanOrEqual(result.finalPrice);
      expect(result.coupon).toBe(0);
      expect(result.orderTotal).toBe(result.finalPrice);
    });

    it('should apply global coupon when provided', async () => {
      productPricingRepo.findOne.mockResolvedValue(mockProductPricing());
      taxRepo.find.mockResolvedValue([]);
      couponRepo.findOne.mockResolvedValue({
        id: 1, code: 'DESCUENTO10', value: 10, isPercentage: true, isGlobal: true,
        usageLimit: null, usageCount: 0, startsAt: null, endsAt: null, isDeleted: false,
      });

      const result = await service.calculateProduct({ productId: 1, couponCode: 'DESCUENTO10' });

      expect(result.coupon).toBeGreaterThan(0);
      expect(result.orderTotal).toBeLessThan(result.finalPrice);
    });

    it('should not apply coupon if usage limit reached', async () => {
      productPricingRepo.findOne.mockResolvedValue(mockProductPricing());
      taxRepo.find.mockResolvedValue([]);
      couponRepo.findOne.mockResolvedValue({
        id: 1, code: 'AGOTADO', value: 10, isPercentage: true, isGlobal: true,
        usageLimit: 5, usageCount: 5, startsAt: null, endsAt: null, isDeleted: false,
      });

      const result = await service.calculateProduct({ productId: 1, couponCode: 'AGOTADO' });

      expect(result.coupon).toBe(0);
    });

    it('should throw NotFoundException if product has no pricing', async () => {
      productPricingRepo.findOne.mockResolvedValue(null);
      await expect(service.calculateProduct({ productId: 999 })).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================
  // calculateCombo
  // ==========================

  describe('calculateCombo', () => {
    it('should calculate combo price correctly', async () => {
      comboPricingRepo.findOne.mockResolvedValue(mockComboPricing());
      taxRepo.find.mockResolvedValue([]);

      const result = await service.calculateCombo({ comboId: 1 });

      expect(result.unitPrice).toBe(1200);
      expect(result.finalPrice).toBeGreaterThan(result.unitPrice);
      expect(result.coupon).toBe(0);
      expect(result.orderTotal).toBe(result.finalPrice);
    });

    it('should throw NotFoundException if combo has no pricing', async () => {
      comboPricingRepo.findOne.mockResolvedValue(null);
      await expect(service.calculateCombo({ comboId: 999 })).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================
  // preview
  // ==========================

  describe('preview', () => {
    it('should calculate preview without DB', () => {
      const result = service.preview({
        unitPrice: 500,
        discount: { value: 10, isPercentage: true },
        marginValue: 20,
        marginIsPercentage: true,
        taxes: [{ value: 21, isPercentage: true }],
        couponValue: 0,
        couponIsPercentage: true,
      } as any);

      expect(result.unitPrice).toBe(500);
      expect(result.discount).toBeGreaterThan(0);
      expect(result.finalPrice).toBeGreaterThan(0);
      expect(result.fullPrice).toBeGreaterThanOrEqual(result.finalPrice);
    });
  });
});