import { Test, TestingModule } from '@nestjs/testing';
import { ComboTaxesService } from './combo-taxes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ComboTaxEntity } from '../entities/combo-taxes.entity';
import { TaxEntity } from 'src/modules/taxation/taxes/entities/tax.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ComboTaxesService', () => {
  let service: ComboTaxesService;
  let comboTaxRepository: jest.Mocked<Repository<ComboTaxEntity>>;
  let taxRepository: jest.Mocked<Repository<TaxEntity>>;

  const mockComboTaxRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
  });

  const mockTaxRepository = () => ({
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComboTaxesService,
        {
          provide: getRepositoryToken(ComboTaxEntity),
          useFactory: mockComboTaxRepository,
        },
        {
          provide: getRepositoryToken(TaxEntity),
          useFactory: mockTaxRepository,
        },
      ],
    }).compile();

    service = module.get<ComboTaxesService>(ComboTaxesService);
    comboTaxRepository = module.get(getRepositoryToken(ComboTaxEntity));
    taxRepository = module.get(getRepositoryToken(TaxEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockTax = (overrides = {}): TaxEntity =>
    ({
      id: 1,
      taxTypeId: 1,
      value: 21,
      isPercentage: true,
      isGlobal: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as unknown as TaxEntity;

  const mockComboTax = (overrides = {}): ComboTaxEntity =>
    ({
      id: 1,
      comboId: 1,
      taxId: 1,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as unknown as ComboTaxEntity;

  // ==========================
  // create
  // ==========================

  describe('create', () => {
    it('should create a combo tax', async () => {
      const dto = { taxId: 1, comboId: 1 };
      const entity = mockComboTax();

      taxRepository.findOne.mockResolvedValue(mockTax());
      comboTaxRepository.create.mockReturnValue(entity);
      comboTaxRepository.save.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(taxRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.taxId, isDeleted: false },
      });
      expect(comboTaxRepository.create).toHaveBeenCalledWith({
        comboId: dto.comboId,
        taxId: dto.taxId,
      });
      expect(result.comboId).toBe(1);
      expect(result.taxId).toBe(1);
    });

    it('should throw NotFoundException if tax not found', async () => {
      taxRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({ taxId: 99, comboId: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if tax is global', async () => {
      taxRepository.findOne.mockResolvedValue(mockTax({ isGlobal: true }));

      await expect(
        service.create({ taxId: 1, comboId: 1 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ==========================
  // findAll
  // ==========================

  describe('findAll', () => {
    it('should return all combo taxes for a comboId', async () => {
      const entities = [mockComboTax()];
      comboTaxRepository.find.mockResolvedValue(entities);

      const result = await service.findAll(1);

      expect(comboTaxRepository.find).toHaveBeenCalledWith({
        where: { comboId: 1, isDeleted: false },
        order: { createdAt: 'DESC' },
      });
      expect(result.length).toBe(1);
      expect(result[0].comboId).toBe(1);
    });

    it('should return empty array if no combo taxes', async () => {
      comboTaxRepository.find.mockResolvedValue([]);

      const result = await service.findAll(1);

      expect(result).toEqual([]);
    });
  });

  // ==========================
  // findOne
  // ==========================

  describe('findOne', () => {
    it('should return a combo tax by id', async () => {
      comboTaxRepository.findOne.mockResolvedValue(mockComboTax());

      const result = await service.findOne(1);

      expect(comboTaxRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, isDeleted: false },
      });
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if not found', async () => {
      comboTaxRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================
  // update
  // ==========================

  describe('update', () => {
    it('should update a combo tax', async () => {
      const entity = mockComboTax();
      const updated = mockComboTax({ taxId: 2 });

      comboTaxRepository.findOne.mockResolvedValue(entity);
      comboTaxRepository.merge.mockReturnValue(updated);
      comboTaxRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, { taxId: 2 });

      expect(comboTaxRepository.merge).toHaveBeenCalledWith(entity, { taxId: 2 });
      expect(result.taxId).toBe(2);
    });

    it('should throw NotFoundException if not found', async () => {
      comboTaxRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, { taxId: 2 })).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================
  // remove
  // ==========================

  describe('remove', () => {
    it('should soft delete a combo tax', async () => {
      const entity = mockComboTax();

      comboTaxRepository.findOne.mockResolvedValue(entity);
      comboTaxRepository.save.mockResolvedValue({ ...entity, isDeleted: true });

      await service.remove(1);

      expect(comboTaxRepository.save).toHaveBeenCalledWith({
        ...entity,
        isDeleted: true,
      });
    });

    it('should throw NotFoundException if not found', async () => {
      comboTaxRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});