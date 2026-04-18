import { Test, TestingModule } from '@nestjs/testing';
import { MarginsService } from './margins.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MarginEntity } from '../entities/margin.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('MarginsService', () => {
  let service: MarginsService;
  let marginRepository: jest.Mocked<Repository<MarginEntity>>;

  const mockMarginRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarginsService,
        {
          provide: getRepositoryToken(MarginEntity),
          useFactory: mockMarginRepository,
        },
      ],
    }).compile();

    service = module.get<MarginsService>(MarginsService);
    marginRepository = module.get(getRepositoryToken(MarginEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockMargin = (overrides = {}): MarginEntity =>
    ({
      id: 1,
      name: 'Margen estándar',
      value: 20,
      isPercentage: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as unknown as MarginEntity;

  // ==========================
  // create
  // ==========================

  describe('create', () => {
    it('should create a margin', async () => {
      const dto = { name: 'Margen estándar', value: 20, isPercentage: true };
      const entity = mockMargin();

      marginRepository.create.mockReturnValue(entity);
      marginRepository.save.mockResolvedValue(entity);

      const result = await service.create(dto as any);

      expect(marginRepository.create).toHaveBeenCalledWith(dto);
      expect(marginRepository.save).toHaveBeenCalledWith(entity);
      expect(result.value).toBe(20);
      expect(result.name).toBe('Margen estándar');
    });
  });

  // ==========================
  // findAll
  // ==========================

  describe('findAll', () => {
    it('should return all margins', async () => {
      const entities = [mockMargin()];
      marginRepository.find.mockResolvedValue(entities);

      const result = await service.findAll();

      expect(marginRepository.find).toHaveBeenCalledWith({
        where: { isDeleted: false },
        order: { createdAt: 'DESC' },
      });
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Margen estándar');
    });

    it('should return empty array if no margins', async () => {
      marginRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ==========================
  // findOne
  // ==========================

  describe('findOne', () => {
    it('should return a margin by id', async () => {
      marginRepository.findOne.mockResolvedValue(mockMargin());

      const result = await service.findOne(1);

      expect(marginRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, isDeleted: false },
      });
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if not found', async () => {
      marginRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================
  // update
  // ==========================

  describe('update', () => {
    it('should update a margin', async () => {
      const entity = mockMargin();
      const updated = mockMargin({ value: 30 });

      marginRepository.findOne.mockResolvedValue(entity);
      marginRepository.merge.mockReturnValue(updated);
      marginRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, { value: 30 } as any);

      expect(marginRepository.merge).toHaveBeenCalledWith(entity, { value: 30 });
      expect(result.value).toBe(30);
    });

    it('should throw NotFoundException if not found', async () => {
      marginRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(1, { value: 30 } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================
  // remove
  // ==========================

  describe('remove', () => {
    it('should soft delete a margin', async () => {
      const entity = mockMargin();

      marginRepository.findOne.mockResolvedValue(entity);
      marginRepository.save.mockResolvedValue({ ...entity, isDeleted: true });

      await service.remove(1);

      expect(marginRepository.save).toHaveBeenCalledWith({
        ...entity,
        isDeleted: true,
      });
    });

    it('should throw NotFoundException if not found', async () => {
      marginRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});