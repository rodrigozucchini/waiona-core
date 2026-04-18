import { Test, TestingModule } from '@nestjs/testing';
import { DiscountsService } from './discounts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DiscountEntity } from '../entities/discounts.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CurrencyCode } from 'src/common/enums/currency-code.enum';

describe('DiscountsService', () => {
  let service: DiscountsService;
  let discountRepository: jest.Mocked<Repository<DiscountEntity>>;

  const mockDiscountRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscountsService,
        {
          provide: getRepositoryToken(DiscountEntity),
          useFactory: mockDiscountRepository,
        },
      ],
    }).compile();

    service = module.get<DiscountsService>(DiscountsService);
    discountRepository = module.get(getRepositoryToken(DiscountEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockDiscount = (overrides = {}): DiscountEntity =>
    ({
      id: 1,
      name: 'Descuento verano',
      description: null,
      value: 10,
      isPercentage: true,
      currency: null,
      startsAt: null,
      endsAt: null,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as unknown as DiscountEntity;

  // ==========================
  // create
  // ==========================

  describe('create', () => {
    it('should create a percentage discount', async () => {
      const dto = { name: 'Descuento verano', value: 10, isPercentage: true };
      const entity = mockDiscount();

      discountRepository.create.mockReturnValue(entity);
      discountRepository.save.mockResolvedValue(entity);

      const result = await service.create(dto as any);

      expect(discountRepository.create).toHaveBeenCalled();
      expect(result.value).toBe(10);
      expect(result.isPercentage).toBe(true);
    });

    it('should create a fixed discount with currency', async () => {
      const dto = { name: 'Descuento fijo', value: 100, isPercentage: false, currency: CurrencyCode.ARS };
      const entity = mockDiscount({ value: 100, isPercentage: false, currency: CurrencyCode.ARS });

      discountRepository.create.mockReturnValue(entity);
      discountRepository.save.mockResolvedValue(entity);

      const result = await service.create(dto as any);

      expect(result.isPercentage).toBe(false);
    });

    it('should throw if percentage exceeds 100', async () => {
      const dto = { name: 'Descuento', value: 110, isPercentage: true };

      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw if fixed discount has no currency', async () => {
      const dto = { name: 'Descuento', value: 100, isPercentage: false };

      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw if startsAt is after endsAt', async () => {
      const dto = {
        name: 'Descuento',
        value: 10,
        isPercentage: true,
        startsAt: new Date('2026-12-01'),
        endsAt: new Date('2026-01-01'),
      };

      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw if startsAt equals endsAt', async () => {
      const date = new Date('2026-06-01');
      const dto = {
        name: 'Descuento',
        value: 10,
        isPercentage: true,
        startsAt: date,
        endsAt: date,
      };

      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should set currency to null if isPercentage is true', async () => {
      const dto = { name: 'Descuento', value: 10, isPercentage: true, currency: CurrencyCode.ARS };
      const entity = mockDiscount({ currency: null });

      discountRepository.create.mockReturnValue(entity);
      discountRepository.save.mockResolvedValue(entity);

      const result = await service.create(dto as any);

      expect(discountRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ currency: null }),
      );
      expect(result.currency).toBeNull();
    });
  });

  // ==========================
  // findAll
  // ==========================

  describe('findAll', () => {
    it('should return all discounts', async () => {
      const entities = [mockDiscount()];
      discountRepository.find.mockResolvedValue(entities);

      const result = await service.findAll();

      expect(discountRepository.find).toHaveBeenCalledWith({
        where: { isDeleted: false },
        order: { createdAt: 'DESC' },
      });
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Descuento verano');
    });

    it('should return empty array if no discounts', async () => {
      discountRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ==========================
  // findOne
  // ==========================

  describe('findOne', () => {
    it('should return a discount by id', async () => {
      discountRepository.findOne.mockResolvedValue(mockDiscount());

      const result = await service.findOne(1);

      expect(discountRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, isDeleted: false },
      });
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if not found', async () => {
      discountRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================
  // update
  // ==========================

  describe('update', () => {
    it('should update a discount name', async () => {
      const entity = mockDiscount();
      const updated = mockDiscount({ name: 'Nuevo nombre' });

      discountRepository.findOne.mockResolvedValue(entity);
      discountRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, { name: 'Nuevo nombre' } as any);

      expect(result.name).toBe('Nuevo nombre');
    });

    it('should throw if updated percentage exceeds 100', async () => {
      const entity = mockDiscount();
      discountRepository.findOne.mockResolvedValue(entity);

      await expect(
        service.update(1, { value: 110 } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if dates are invalid on update', async () => {
      const entity = mockDiscount();
      discountRepository.findOne.mockResolvedValue(entity);

      await expect(
        service.update(1, {
          startsAt: new Date('2026-12-01'),
          endsAt: new Date('2026-01-01'),
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if not found', async () => {
      discountRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(1, { name: 'X' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================
  // remove
  // ==========================

  describe('remove', () => {
    it('should soft delete a discount', async () => {
      const entity = mockDiscount();

      discountRepository.findOne.mockResolvedValue(entity);
      discountRepository.save.mockResolvedValue({ ...entity, isDeleted: true });

      await service.remove(1);

      expect(discountRepository.save).toHaveBeenCalledWith({
        ...entity,
        isDeleted: true,
      });
    });

    it('should throw NotFoundException if not found', async () => {
      discountRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});