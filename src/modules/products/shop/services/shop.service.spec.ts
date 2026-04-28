import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { ShopService } from '../../../products/shop/services/shop.service';
import { ProductEntity } from '../../../products/product/entities/product.entity';
import { ComboEntity } from '../../../products/combos/entities/combo.entity';
import { CalculationService } from 'src/modules/pricing/calculation/services/calculation.service';
import { StockItemsService } from 'src/modules/stocks/stock-item/services/stock-item.service';

describe('ShopService', () => {
  let service: ShopService;

  const mockProductRepo = { findAndCount: jest.fn(), findOne: jest.fn() };
  const mockComboRepo   = { findAndCount: jest.fn(), findOne: jest.fn() };
  const mockCalculation = { calculateProduct: jest.fn(), calculateCombo: jest.fn() };
  const mockStock       = { findByProduct: jest.fn(), findByCombo: jest.fn() };

  const mockPriceBreakdown = (overrides = {}) => ({
    unitPrice: 500, discount: 50, priceAfterDiscount: 450,
    margin: 90, priceAfterMargin: 540, taxes: 113.4,
    finalPrice: 653.4, fullPrice: 726, coupon: 0, orderTotal: 653.4,
    ...overrides,
  });

  const mockStockItem = (overrides = {}) => ({
    quantityAvailable: 10, stockMin: 5, stockCritical: 2, ...overrides,
  });

  const mockProduct = (overrides = {}): ProductEntity =>
    ({ id: 1, name: 'Coca Cola 500ml', description: 'Gaseosa', isActive: true, isDeleted: false,
       categoryId: 1, images: [], ...overrides }) as unknown as ProductEntity;

  const mockCombo = (overrides = {}): ComboEntity =>
    ({ id: 1, name: 'Combo Coca x3', description: 'Tres Coca Cola', isActive: true, isDeleted: false,
       categoryId: 2, images: [], items: [{ productId: 1, quantity: 3, product: { name: 'Coca Cola 500ml' } }], ...overrides }) as unknown as ComboEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopService,
        { provide: getRepositoryToken(ProductEntity), useValue: mockProductRepo },
        { provide: getRepositoryToken(ComboEntity),   useValue: mockComboRepo   },
        { provide: CalculationService,                useValue: mockCalculation  },
        { provide: StockItemsService,                 useValue: mockStock        },
      ],
    }).compile();

    service = module.get<ShopService>(ShopService);
  });

  afterEach(() => jest.clearAllMocks());

  // ==========================
  // search
  // ==========================

  describe('search', () => {
    it('should return paginated products and combos', async () => {
      mockProductRepo.findAndCount.mockResolvedValue([[mockProduct()], 1]);
      mockComboRepo.findAndCount.mockResolvedValue([[mockCombo()], 1]);
      mockCalculation.calculateProduct.mockResolvedValue(mockPriceBreakdown());
      mockCalculation.calculateCombo.mockResolvedValue(mockPriceBreakdown());
      mockStock.findByProduct.mockResolvedValue(mockStockItem());
      mockStock.findByCombo.mockResolvedValue({ quantityAvailable: 3, inStock: true });

      const result = await service.search({} as any);

      expect(result.total).toBe(2);
      expect(result.data).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.hasNextPage).toBe(false);
    });

    it('should filter only products when type=product', async () => {
      mockProductRepo.findAndCount.mockResolvedValue([[mockProduct()], 1]);
      mockCalculation.calculateProduct.mockResolvedValue(mockPriceBreakdown());
      mockStock.findByProduct.mockResolvedValue(mockStockItem());

      const result = await service.search({ type: 'product' } as any);

      expect(mockComboRepo.findAndCount).not.toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe('product');
    });

    it('should filter only combos when type=combo', async () => {
      mockComboRepo.findAndCount.mockResolvedValue([[mockCombo()], 1]);
      mockCalculation.calculateCombo.mockResolvedValue(mockPriceBreakdown());
      mockStock.findByCombo.mockResolvedValue({ quantityAvailable: 3, inStock: true });

      const result = await service.search({ type: 'combo' } as any);

      expect(mockProductRepo.findAndCount).not.toHaveBeenCalled();
      expect(result.data[0].type).toBe('combo');
    });

    it('should skip product without pricing', async () => {
      mockProductRepo.findAndCount.mockResolvedValue([[mockProduct()], 1]);
      mockComboRepo.findAndCount.mockResolvedValue([[], 0]);
      mockCalculation.calculateProduct.mockRejectedValue(new Error('No pricing'));

      const result = await service.search({} as any);

      expect(result.data).toHaveLength(0);
    });

    it('should filter by minPrice', async () => {
      mockProductRepo.findAndCount.mockResolvedValue([[mockProduct()], 1]);
      mockComboRepo.findAndCount.mockResolvedValue([[], 0]);
      mockCalculation.calculateProduct.mockResolvedValue(mockPriceBreakdown({ finalPrice: 100 }));
      mockStock.findByProduct.mockResolvedValue(mockStockItem());

      const result = await service.search({ minPrice: 500 } as any);

      expect(result.data).toHaveLength(0); // finalPrice 100 < minPrice 500
    });

    it('should return correct pagination', async () => {
      mockProductRepo.findAndCount.mockResolvedValue([[], 50]);
      mockComboRepo.findAndCount.mockResolvedValue([[], 50]);

      const result = await service.search({ page: 2, limit: 10 } as any);

      expect(result.total).toBe(100);
      expect(result.totalPages).toBe(10);
      expect(result.hasNextPage).toBe(true);
    });
  });

  // ==========================
  // findById
  // ==========================

  describe('findById', () => {
    it('should throw BadRequestException if no type', async () => {
      await expect(service.findById(1, undefined as any)).rejects.toThrow(BadRequestException);
    });

    it('should return product detail', async () => {
      mockProductRepo.findOne.mockResolvedValue(mockProduct());
      mockCalculation.calculateProduct.mockResolvedValue(mockPriceBreakdown());
      mockStock.findByProduct.mockResolvedValue(mockStockItem());

      const result = await service.findById(1, 'product');

      expect(result.type).toBe('product');
      expect(result.finalPrice).toBe(653.4);
      expect(result.stockStatus).toBe('available');
    });

    it('should return combo detail', async () => {
      mockComboRepo.findOne.mockResolvedValue(mockCombo());
      mockCalculation.calculateCombo.mockResolvedValue(mockPriceBreakdown());
      mockStock.findByCombo.mockResolvedValue({ quantityAvailable: 3, inStock: true });

      const result = await service.findById(1, 'combo');

      expect(result.type).toBe('combo');
      expect(result.items).toHaveLength(1);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);
      await expect(service.findById(999, 'product')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if product has no pricing', async () => {
      mockProductRepo.findOne.mockResolvedValue(mockProduct());
      mockCalculation.calculateProduct.mockRejectedValue(new Error('No pricing'));
      await expect(service.findById(1, 'product')).rejects.toThrow(NotFoundException);
    });

    it('should resolve stockStatus correctly', async () => {
      mockProductRepo.findOne.mockResolvedValue(mockProduct());
      mockCalculation.calculateProduct.mockResolvedValue(mockPriceBreakdown());

      // critical
      mockStock.findByProduct.mockResolvedValue(mockStockItem({ quantityAvailable: 1, stockCritical: 2, stockMin: 5 }));
      const critical = await service.findById(1, 'product');
      expect(critical.stockStatus).toBe('critical');

      // low
      mockStock.findByProduct.mockResolvedValue(mockStockItem({ quantityAvailable: 3, stockCritical: 1, stockMin: 5 }));
      const low = await service.findById(1, 'product');
      expect(low.stockStatus).toBe('low');

      // out_of_stock
      mockStock.findByProduct.mockResolvedValue(mockStockItem({ quantityAvailable: 0 }));
      const out = await service.findById(1, 'product');
      expect(out.stockStatus).toBe('out_of_stock');
    });
  });
});