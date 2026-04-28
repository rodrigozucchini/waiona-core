import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CategoryService } from '../../../products/categories/services/category.service';
import { CategoryEntity } from '../../../products/categories/entities/category.entity';

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryRepository: jest.Mocked<Repository<CategoryEntity>>;

  const mockRepo = () => ({ find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn(), merge: jest.fn() });

  const mockCategory = (overrides = {}): CategoryEntity =>
    ({ id: 1, name: 'Bebidas', description: 'Bebidas en general', isActive: true, isDeleted: false,
       parentId: null, children: [], createdAt: new Date(), updatedAt: new Date(), ...overrides }) as unknown as CategoryEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: getRepositoryToken(CategoryEntity), useFactory: mockRepo },
      ],
    }).compile();

    service            = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get(getRepositoryToken(CategoryEntity));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return all categories', async () => {
      categoryRepository.find.mockResolvedValue([mockCategory()]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bebidas');
    });

    it('should return empty array', async () => {
      categoryRepository.find.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a category', async () => {
      categoryRepository.findOne.mockResolvedValue(mockCategory());
      const result = await service.findById(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException', async () => {
      categoryRepository.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a category without parent', async () => {
      const entity = mockCategory();
      categoryRepository.create.mockReturnValue(entity);
      categoryRepository.save.mockResolvedValue(entity);
      const result = await service.create({ name: 'Bebidas', isActive: true } as any);
      expect(result.name).toBe('Bebidas');
    });

    it('should throw BadRequestException if parentId not found', async () => {
      categoryRepository.findOne.mockResolvedValue(null);
      await expect(service.create({ name: 'Sub', parentId: 99 } as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const entity  = mockCategory();
      const updated = mockCategory({ name: 'Gaseosas' });
      categoryRepository.findOne.mockResolvedValue(entity);
      categoryRepository.merge.mockReturnValue(updated);
      categoryRepository.save.mockResolvedValue(updated);
      const result = await service.update(1, { name: 'Gaseosas' } as any);
      expect(result.name).toBe('Gaseosas');
    });

    it('should throw BadRequestException if category is its own parent', async () => {
      categoryRepository.findOne.mockResolvedValue(mockCategory());
      await expect(service.update(1, { parentId: 1 } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if not found', async () => {
      categoryRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft delete a category', async () => {
      const entity = mockCategory();
      categoryRepository.findOne.mockResolvedValue(entity);
      categoryRepository.save.mockResolvedValue({ ...entity, isDeleted: true } as any);
      await service.delete(1);
      expect(categoryRepository.save).toHaveBeenCalledWith({ ...entity, isDeleted: true });
    });

    it('should throw NotFoundException', async () => {
      categoryRepository.findOne.mockResolvedValue(null);
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTree', () => {
    it('should return tree of root categories', async () => {
      const root = mockCategory({ children: [mockCategory({ id: 2, name: 'Gaseosas', parentId: 1 })] });
      categoryRepository.find.mockResolvedValue([root]);
      const result = await service.getTree();
      expect(result).toHaveLength(1);
    });
  });
});