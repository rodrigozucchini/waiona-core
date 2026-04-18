import { Test, TestingModule } from '@nestjs/testing';
import { TaxesService } from './taxes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaxEntity } from '../entities/tax.entity';
import { TaxTypeEntity } from '../../tax-types/entities/tax-types.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CurrencyCode } from '../../../../common/enums/currency-code.enum';

describe('TaxesService', () => {
  let service: TaxesService;
  let taxRepository: jest.Mocked<Repository<TaxEntity>>;
  let taxTypeRepository: jest.Mocked<Repository<TaxTypeEntity>>;

  const mockTaxRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
  });

  const mockTaxTypeRepository = () => ({
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxesService,
        {
          provide: getRepositoryToken(TaxEntity),
          useFactory: mockTaxRepository,
        },
        {
          provide: getRepositoryToken(TaxTypeEntity),
          useFactory: mockTaxTypeRepository,
        },
      ],
    }).compile();

    service = module.get<TaxesService>(TaxesService);
    taxRepository = module.get(getRepositoryToken(TaxEntity));
    taxTypeRepository = module.get(getRepositoryToken(TaxTypeEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockTaxType = (overrides = {}): TaxTypeEntity =>
    ({
      id: 1,
      code: 'IVA',
      name: 'Impuesto al Valor Agregado',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as TaxTypeEntity;

    const mockTax = (overrides = {}): TaxEntity =>
      ({
        id: 1,
        taxTypeId: 1,
        taxType: mockTaxType(),
        value: 21,
        isPercentage: true,
        currency: undefined, // 🔥 undefined en vez de null
        isGlobal: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
      }) as unknown as TaxEntity;

  // ==========================
  // findAll
  // ==========================

  describe('findAll', () => {
    it('should return taxes for a taxTypeId', async () => {
      const entities = [mockTax()];
      taxRepository.find.mockResolvedValue(entities);

      const result = await service.findAll(1);

      expect(taxRepository.find).toHaveBeenCalledWith({
        where: { taxTypeId: 1, isDeleted: false },
        relations: ['taxType'],
        order: { createdAt: 'DESC' },
      });

      expect(result.length).toBe(1);
      expect(result[0].value).toBe(21);
    });

    it('should return empty array if no taxes found', async () => {
      taxRepository.find.mockResolvedValue([]);

      const result = await service.findAll(1);

      expect(result).toEqual([]);
    });
  });

  // ==========================
  // findById
  // ==========================

  describe('findById', () => {
    it('should return a tax by id', async () => {
      taxRepository.findOne.mockResolvedValue(mockTax());

      const result = await service.findById(1);

      expect(taxRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, isDeleted: false },
        relations: ['taxType'],
      });

      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if not found', async () => {
      taxRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================
  // create
  // ==========================

  describe('create', () => {
    it('should create a percentage tax', async () => {
      const dto = { value: 21, isPercentage: true };
      const entity = mockTax();

      taxTypeRepository.findOne.mockResolvedValue(mockTaxType());
      taxRepository.create.mockReturnValue(entity);
      taxRepository.save.mockResolvedValue(entity);
      taxRepository.findOne.mockResolvedValue(entity);

      const result = await service.create(1, dto as any);

      expect(taxTypeRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, isDeleted: false },
      });
      expect(result.value).toBe(21);
      expect(result.isPercentage).toBe(true);
    });

    it('should create a fixed tax with currency', async () => {
      const dto = { value: 50, isPercentage: false, currency: CurrencyCode.ARS };
      const entity = mockTax({ value: 50, isPercentage: false, currency: CurrencyCode.ARS });

      taxTypeRepository.findOne.mockResolvedValue(mockTaxType());
      taxRepository.create.mockReturnValue(entity);
      taxRepository.save.mockResolvedValue(entity);
      taxRepository.findOne.mockResolvedValue(entity);

      const result = await service.create(1, dto as any);

      expect(result.isPercentage).toBe(false);
    });

    it('should throw if taxType not found', async () => {
      taxTypeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(99, { value: 21, isPercentage: true } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if fixed tax has no currency', async () => {
      taxTypeRepository.findOne.mockResolvedValue(mockTaxType());

      await expect(
        service.create(1, { value: 50, isPercentage: false } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if percentage tax has currency', async () => {
      taxTypeRepository.findOne.mockResolvedValue(mockTaxType());

      await expect(
        service.create(1, { value: 21, isPercentage: true, currency: CurrencyCode.ARS } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ==========================
  // update
  // ==========================

  describe('update', () => {
    it('should update a tax value', async () => {
      const entity = mockTax();
      const updated = mockTax({ value: 15 });

      taxRepository.findOne
        .mockResolvedValueOnce(entity)
        .mockResolvedValueOnce(updated);

      taxRepository.merge.mockReturnValue(updated);
      taxRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, { value: 15 } as any);

      expect(result.value).toBe(15);
    });

    it('should throw if fixed tax has no currency after update', async () => {
      const entity = mockTax({ isPercentage: false, currency: null });

      taxRepository.findOne.mockResolvedValue(entity);

      await expect(
        service.update(1, { isPercentage: false } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if percentage tax has currency after update', async () => {
      const entity = mockTax({ isPercentage: true, currency: null });

      taxRepository.findOne.mockResolvedValue(entity);

      await expect(
        service.update(1, { currency: CurrencyCode.ARS } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if not found', async () => {
      taxRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(1, { value: 10 } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================
  // delete
  // ==========================

  describe('delete', () => {
    it('should soft delete a tax', async () => {
      const entity = mockTax();

      taxRepository.findOne.mockResolvedValue(entity);
      taxRepository.save.mockResolvedValue({ ...entity, isDeleted: true });

      await service.delete(1);

      expect(taxRepository.save).toHaveBeenCalledWith({
        ...entity,
        isDeleted: true,
      });
    });

    it('should throw if not found', async () => {
      taxRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });
  });
});