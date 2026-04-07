import { Test, TestingModule } from '@nestjs/testing';
import { TaxTypesService } from './tax-types.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaxTypeEntity } from '../entities/tax-types.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('TaxTypesService', () => {
  let service: TaxTypesService;
  let repository: jest.Mocked<Repository<TaxTypeEntity>>;

  const mockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxTypesService,
        {
          provide: getRepositoryToken(TaxTypeEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TaxTypesService>(TaxTypesService);
    repository = module.get(getRepositoryToken(TaxTypeEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockEntity = (overrides = {}): TaxTypeEntity =>
    ({
      id: 1,
      code: 'IVA',
      name: 'Impuesto',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as TaxTypeEntity;

  describe('findAll', () => {
    it('should return mapped tax types', async () => {
      const entities = [mockEntity()];

      repository.find.mockResolvedValue(entities);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        where: { isDeleted: false },
        order: { createdAt: 'DESC' },
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 1,
          code: 'IVA',
          name: 'Impuesto',
        }),
      );
    });

    it('should return empty array if none found', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return one tax type', async () => {
      const entity = mockEntity();

      repository.findOne.mockImplementation((options: any) => {
        if (options.where.id === 1 && options.where.isDeleted === false) {
          return Promise.resolve(entity);
        }
        return Promise.resolve(null);
      });

      const result = await service.findById(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          code: 'IVA',
        }),
      );
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new tax type', async () => {
      const dto = { code: 'IVA', name: 'Impuesto' };

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(dto as any);
      repository.save.mockResolvedValue(mockEntity(dto));

      const result = await service.create(dto as any);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { code: dto.code },
      });

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();

      expect(result).toMatchObject(dto);
    });

    it('should throw if code already exists', async () => {
      repository.findOne.mockResolvedValue(mockEntity());

      await expect(
        service.create({ code: 'IVA', name: 'Test' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update tax type without changing code', async () => {
      const entity = mockEntity();

      repository.findOne.mockResolvedValue(entity);
      repository.merge.mockReturnValue({ ...entity, name: 'New' });
      repository.save.mockResolvedValue({ ...entity, name: 'New' });

      const result = await service.update(1, {
        name: 'New',
      } as any);

      expect(result.name).toBe('New');
    });

    it('should NOT validate code uniqueness if code is the same', async () => {
      const entity = mockEntity({ code: 'IVA' });

      repository.findOne.mockResolvedValue(entity);
      repository.merge.mockReturnValue(entity);
      repository.save.mockResolvedValue(entity);

      await service.update(1, { code: 'IVA' } as any);

      expect(repository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should validate unique code if changed', async () => {
      const entity = mockEntity({ code: 'OLD' });

      repository.findOne.mockImplementation((options: any) => {
        if (options.where.id) return Promise.resolve(entity);
        if (options.where.code === 'NEW') return Promise.resolve(null);
        return Promise.resolve(null);
      });

      repository.merge.mockReturnValue({ ...entity, code: 'NEW' });
      repository.save.mockResolvedValue({ ...entity, code: 'NEW' });

      const result = await service.update(1, {
        code: 'NEW',
      } as any);

      expect(result.code).toBe('NEW');
    });

    it('should throw if new code already exists', async () => {
      const entity = mockEntity({ code: 'OLD' });

      repository.findOne.mockImplementation((options: any) => {
        if (options.where.id) return Promise.resolve(entity);
        if (options.where.code === 'NEW') return Promise.resolve(mockEntity());
        return Promise.resolve(null);
      });

      await expect(
        service.update(1, { code: 'NEW' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if entity not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update(1, { name: 'X' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft delete a tax type', async () => {
      const entity = mockEntity();

      repository.findOne.mockResolvedValue(entity);

      await service.delete(1);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isDeleted: true }),
      );
    });

    it('should not fail if already deleted', async () => {
      const entity = mockEntity({ isDeleted: true });

      repository.findOne.mockResolvedValue(entity);

      await service.delete(1);

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw if not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});