import { Test, TestingModule } from '@nestjs/testing';
import { DiscountProductTargetService } from './discount-product-target.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DiscountProductTargetEntity } from '../entities/discount-product-target.entity';
import { DiscountEntity } from '../../discount/entities/discounts.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('DiscountProductTargetService', () => {
  let service: DiscountProductTargetService;
  let repo: jest.Mocked<Repository<DiscountProductTargetEntity>>;
  let discountRepository: jest.Mocked<Repository<DiscountEntity>>;

  const mockRepo = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  });

  const mockDiscountRepository = () => ({
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscountProductTargetService,
        {
          provide: getRepositoryToken(DiscountProductTargetEntity),
          useFactory: mockRepo,
        },
        {
          provide: getRepositoryToken(DiscountEntity),
          useFactory: mockDiscountRepository,
        },
      ],
    }).compile();

    service = module.get<DiscountProductTargetService>(DiscountProductTargetService);
    repo = module.get(getRepositoryToken(DiscountProductTargetEntity));
    discountRepository = module.get(getRepositoryToken(DiscountEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockDiscount = (overrides = {}): DiscountEntity =>
    ({
      id: 1,
      name: 'Descuento verano',
      value: 10,
      isPercentage: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as unknown as DiscountEntity;

  const mockTarget = (overrides = {}): DiscountProductTargetEntity =>
    ({
      id: 1,
      discountId: 1,
      productId: 1,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as unknown as DiscountProductTargetEntity;

  // ==========================
  // create
  // ==========================

  describe('create', () => {
    it('should create a product target', async () => {
      const dto = { productId: 1 };
      const entity = mockTarget();

      discountRepository.findOne.mockResolvedValue(mockDiscount());
      repo.findOne
        .mockResolvedValueOnce(null) // validateUniqueTarget
        .mockResolvedValueOnce(null); // validateProductHasNoActiveDiscount
      repo.create.mockReturnValue(entity);
      repo.save.mockResolvedValue(entity);

      const result = await service.create(1, dto);

      expect(discountRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, isDeleted: false },
      });
      expect(repo.create).toHaveBeenCalledWith({ discountId: 1, productId: 1 });
      expect(result.productId).toBe(1);
      expect(result.discountId).toBe(1);
    });

    it('should throw NotFoundException if discount not found', async () => {
      discountRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(99, { productId: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if target already exists for this discount', async () => {
      discountRepository.findOne.mockResolvedValue(mockDiscount());
      repo.findOne.mockResolvedValueOnce(mockTarget()); // validateUniqueTarget

      await expect(
        service.create(1, { productId: 1 }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if product already has an active discount', async () => {
      discountRepository.findOne.mockResolvedValue(mockDiscount());
      repo.findOne
        .mockResolvedValueOnce(null) // validateUniqueTarget
        .mockResolvedValueOnce(mockTarget()); // validateProductHasNoActiveDiscount

      await expect(
        service.create(1, { productId: 1 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ==========================
  // findAll
  // ==========================

  describe('findAll', () => {
    it('should return all targets for a discount', async () => {
      const entities = [mockTarget()];

      discountRepository.findOne.mockResolvedValue(mockDiscount());
      repo.find.mockResolvedValue(entities);

      const result = await service.findAll(1);

      expect(repo.find).toHaveBeenCalledWith({
        where: { discountId: 1, isDeleted: false },
      });
      expect(result.length).toBe(1);
      expect(result[0].discountId).toBe(1);
    });

    it('should return empty array if no targets', async () => {
      discountRepository.findOne.mockResolvedValue(mockDiscount());
      repo.find.mockResolvedValue([]);

      const result = await service.findAll(1);

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException if discount not found', async () => {
      discountRepository.findOne.mockResolvedValue(null);

      await expect(service.findAll(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================
  // remove
  // ==========================

  describe('remove', () => {
    it('should soft delete a product target', async () => {
      const entity = mockTarget();

      discountRepository.findOne.mockResolvedValue(mockDiscount());
      repo.findOne.mockResolvedValue(entity);
      repo.save.mockResolvedValue({ ...entity, isDeleted: true });

      await service.remove(1, 1);

      expect(repo.save).toHaveBeenCalledWith({
        ...entity,
        isDeleted: true,
      });
    });

    it('should throw NotFoundException if discount not found', async () => {
      discountRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(99, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if target not found', async () => {
      discountRepository.findOne.mockResolvedValue(mockDiscount());
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove(1, 99)).rejects.toThrow(NotFoundException);
    });
  });
});