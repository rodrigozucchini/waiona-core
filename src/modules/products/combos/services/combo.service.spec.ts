import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { ComboService } from '../../../products/combos/services/combo.service';
import { ComboEntity } from '../../../products/combos/entities/combo.entity';
import { ComboItemEntity } from '../../../products/combos/entities/combo-item.entity';
import { ProductEntity } from '../../../products/product/entities/product.entity';

describe('ComboService', () => {
  let service: ComboService;

  const mockCategory = { id: 1, name: 'Combos' };

  const mockCombo = (overrides = {}): ComboEntity =>
    ({
      id: 1, name: 'Combo Coca x3', description: 'Tres Coca Cola',
      isActive: true, isDeleted: false, categoryId: 1, category: mockCategory,
      items: [{ productId: 1, quantity: 3, product: { name: 'Coca Cola 500ml' } }],
      images: [], createdAt: new Date(), updatedAt: new Date(), ...overrides,
    }) as unknown as ComboEntity;

  const mockEntityManager = {
    create:  jest.fn(),
    save:    jest.fn(),
    findOne: jest.fn(),
    merge:   jest.fn(),
    delete:  jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(cb => cb(mockEntityManager)),
  };

  const mockComboRepo   = { find: jest.fn(), findOne: jest.fn(), save: jest.fn() };
  const mockItemRepo    = { find: jest.fn() };
  const mockProductRepo = { findOne: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComboService,
        { provide: getRepositoryToken(ComboEntity),     useValue: mockComboRepo   },
        { provide: getRepositoryToken(ComboItemEntity), useValue: mockItemRepo    },
        { provide: getRepositoryToken(ProductEntity),   useValue: mockProductRepo },
        { provide: DataSource,                          useValue: mockDataSource  },
      ],
    }).compile();

    service = module.get<ComboService>(ComboService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return all combos', async () => {
      mockComboRepo.find.mockResolvedValue([mockCombo()]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].categoryName).toBe('Combos');
    });

    it('should return empty array', async () => {
      mockComboRepo.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a combo by id', async () => {
      mockComboRepo.findOne.mockResolvedValue(mockCombo());
      const result = await service.findById(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if not found', async () => {
      mockComboRepo.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a combo', async () => {
      const dto = { name: 'Combo', description: 'Desc', categoryId: 1, items: [{ productId: 1, quantity: 2 }] };
      const combo = mockCombo();
      mockProductRepo.findOne.mockResolvedValue({ id: 1 });
      mockEntityManager.create.mockReturnValue(combo);
      mockEntityManager.save.mockResolvedValue(combo);
      mockEntityManager.findOne.mockResolvedValue(combo);

      const result = await service.create(dto as any);
      expect(result.name).toBe('Combo Coca x3');
    });

    it('should throw BadRequestException for duplicate productId', async () => {
      const dto = { name: 'Combo', description: 'Desc', categoryId: 1,
        items: [{ productId: 1, quantity: 1 }, { productId: 1, quantity: 2 }] };
      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if product not found', async () => {
      const dto = { name: 'Combo', description: 'Desc', categoryId: 1, items: [{ productId: 99, quantity: 1 }] };
      mockProductRepo.findOne.mockResolvedValue(null);
      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should soft delete a combo', async () => {
      const combo = mockCombo();
      mockComboRepo.findOne.mockResolvedValue(combo);
      mockComboRepo.save.mockResolvedValue({ ...combo, isDeleted: true });
      await service.delete(1);
      expect(mockComboRepo.save).toHaveBeenCalledWith({ ...combo, isDeleted: true });
    });

    it('should throw NotFoundException if not found', async () => {
      mockComboRepo.findOne.mockResolvedValue(null);
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});