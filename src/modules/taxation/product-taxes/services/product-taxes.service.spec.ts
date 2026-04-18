import { Test, TestingModule } from '@nestjs/testing';
import { ProductTaxesService } from './product-taxes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductTaxEntity } from '../entities/product-taxes.entity';
import { TaxEntity } from 'src/modules/taxation/taxes/entities/tax.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProductTaxesService', () => {
  let service: ProductTaxesService;
  let productTaxRepository: jest.Mocked<Repository<ProductTaxEntity>>;
  let taxRepository: jest.Mocked<Repository<TaxEntity>>;

  const mockProductTaxRepository = () => ({
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
        ProductTaxesService,
        {
          provide: getRepositoryToken(ProductTaxEntity),
          useFactory: mockProductTaxRepository,
        },
        {
          provide: getRepositoryToken(TaxEntity),
          useFactory: mockTaxRepository,
        },
      ],
    }).compile();

    service = module.get<ProductTaxesService>(ProductTaxesService);
    productTaxRepository = module.get(getRepositoryToken(ProductTaxEntity));
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

  const mockProductTax = (overrides = {}): ProductTaxEntity =>
    ({
      id: 1,
      productId: 1,
      taxId: 1,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as unknown as ProductTaxEntity;

  // ==========================
  // create
  // ==========================

  describe('create', () => {
    it('should create a product tax', async () => {
      const dto = { taxId: 1, productId: 1 };
      const entity = mockProductTax();

      taxRepository.findOne.mockResolvedValue(mockTax());
      productTaxRepository.create.mockReturnValue(entity);
      productTaxRepository.save.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(taxRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.taxId, isDeleted: false },
      });
      expect(productTaxRepository.create).toHaveBeenCalledWith({
        productId: dto.productId,
        taxId: dto.taxId,
      });
      expect(result.productId).toBe(1);
      expect(result.taxId).toBe(1);
    });

    it('should throw NotFoundException if tax not found', async () => {
      taxRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({ taxId: 99, productId: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if tax is global', async () => {
      taxRepository.findOne.mockResolvedValue(mockTax({ isGlobal: true }));

      await expect(
        service.create({ taxId: 1, productId: 1 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ==========================
  // findAll
  // ==========================

  describe('findAll', () => {
    it('should return all product taxes for a productId', async () => {
      const entities = [mockProductTax()];
      productTaxRepository.find.mockResolvedValue(entities);

      const result = await service.findAll(1);

      expect(productTaxRepository.find).toHaveBeenCalledWith({
        where: { productId: 1, isDeleted: false },
        order: { createdAt: 'DESC' },
      });
      expect(result.length).toBe(1);
      expect(result[0].productId).toBe(1);
    });

    it('should return empty array if no product taxes', async () => {
      productTaxRepository.find.mockResolvedValue([]);

      const result = await service.findAll(1);

      expect(result).toEqual([]);
    });
  });

  // ==========================
  // findOne
  // ==========================

  describe('findOne', () => {
    it('should return a product tax by id', async () => {
      productTaxRepository.findOne.mockResolvedValue(mockProductTax());

      const result = await service.findOne(1);

      expect(productTaxRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, isDeleted: false },
      });
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if not found', async () => {
      productTaxRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================
  // update
  // ==========================

  describe('update', () => {
    it('should update a product tax', async () => {
      const entity = mockProductTax();
      const updated = mockProductTax({ taxId: 2 });

      productTaxRepository.findOne.mockResolvedValue(entity);
      productTaxRepository.merge.mockReturnValue(updated);
      productTaxRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, { taxId: 2 });

      expect(productTaxRepository.merge).toHaveBeenCalledWith(entity, { taxId: 2 });
      expect(result.taxId).toBe(2);
    });

    it('should throw NotFoundException if not found', async () => {
      productTaxRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, { taxId: 2 })).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================
  // remove
  // ==========================

  describe('remove', () => {
    it('should soft delete a product tax', async () => {
      const entity = mockProductTax();

      productTaxRepository.findOne.mockResolvedValue(entity);
      productTaxRepository.save.mockResolvedValue({ ...entity, isDeleted: true });

      await service.remove(1);

      expect(productTaxRepository.save).toHaveBeenCalledWith({
        ...entity,
        isDeleted: true,
      });
    });

    it('should throw NotFoundException if not found', async () => {
      productTaxRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});