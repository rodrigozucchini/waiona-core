import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TaxTypesService } from './tax-types.service';
import { TaxTypeEntity } from '../entities/tax-types.entity';

describe('TaxTypesService', () => {
  let service: TaxTypesService;
  let repo: any;

  const mockRepo = () => ({ find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn(), merge: jest.fn() });

  const mockTaxType = (overrides = {}): TaxTypeEntity =>
    ({ id: 1, code: 'IVA', name: 'IVA', isDeleted: false,
       createdAt: new Date(), updatedAt: new Date(), ...overrides }) as unknown as TaxTypeEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxTypesService,
        { provide: getRepositoryToken(TaxTypeEntity), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<TaxTypesService>(TaxTypesService);
    repo    = module.get(getRepositoryToken(TaxTypeEntity));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return all tax types', async () => {
      repo.find.mockResolvedValue([mockTaxType()]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('IVA');
    });

    it('should return empty array', async () => {
      repo.find.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a tax type', async () => {
      repo.findOne.mockResolvedValue(mockTaxType());
      expect((await service.findById(1)).id).toBe(1);
    });

    it('should throw NotFoundException', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a tax type', async () => {
      const entity = mockTaxType();
      repo.findOne.mockResolvedValue(null); // código único
      repo.create.mockReturnValue(entity);
      repo.save.mockResolvedValue(entity);
      const result = await service.create({ code: 'IVA', name: 'IVA' } as any);
      expect(result.code).toBe('IVA');
    });

    it('should throw BadRequestException if code already exists', async () => {
      repo.findOne.mockResolvedValue(mockTaxType());
      await expect(service.create({ code: 'IVA', name: 'IVA' } as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a tax type', async () => {
      const entity  = mockTaxType();
      const updated = mockTaxType({ name: 'IVA Actualizado' });
      repo.findOne.mockResolvedValue(entity);
      repo.merge.mockReturnValue(updated);
      repo.save.mockResolvedValue(updated);
      expect((await service.update(1, { name: 'IVA Actualizado' } as any)).name).toBe('IVA Actualizado');
    });

    it('should throw BadRequestException if new code already exists', async () => {
      repo.findOne
        .mockResolvedValueOnce(mockTaxType({ code: 'IVA' }))    // findOne inicial
        .mockResolvedValueOnce(mockTaxType({ code: 'IIBB' }));  // ensureCodeIsUnique
      await expect(service.update(1, { code: 'IIBB' } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.update(999, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft delete', async () => {
      const entity = mockTaxType();
      repo.findOne.mockResolvedValue(entity);
      repo.save.mockResolvedValue({ ...entity, isDeleted: true });
      await service.delete(1);
      expect(repo.save).toHaveBeenCalledWith({ ...entity, isDeleted: true });
    });

    it('should do nothing if already deleted', async () => {
      repo.findOne.mockResolvedValue(mockTaxType({ isDeleted: true }));
      await service.delete(1);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});