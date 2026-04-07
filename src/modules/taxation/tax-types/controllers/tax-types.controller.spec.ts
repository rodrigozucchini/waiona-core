import { Test, TestingModule } from '@nestjs/testing';
import { TaxTypesController } from './tax-types.controller';
import { TaxTypesService } from '../services/tax-types.service';

describe('TaxTypesController', () => {
  let controller: TaxTypesController;
  let service: jest.Mocked<TaxTypesService>;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxTypesController],
      providers: [
        {
          provide: TaxTypesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TaxTypesController>(TaxTypesController);
    service = module.get(TaxTypesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTaxTypes', () => {
    it('should return all tax types', async () => {
      const mockResponse = [
        { id: 1, code: 'IVA', name: 'Impuesto' },
      ];

      service.findAll.mockResolvedValue(mockResponse as any);

      const result = await controller.getTaxTypes();

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findTaxType', () => {
    it('should return one tax type', async () => {
      const mockResponse = {
        id: 1,
        code: 'IVA',
        name: 'Impuesto',
      };

      service.findById.mockResolvedValue(mockResponse as any);

      const result = await controller.findTaxType(1);

      expect(result).toEqual(mockResponse);
      expect(service.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('createTaxType', () => {
    it('should create a tax type', async () => {
      const dto = { code: 'IVA', name: 'Impuesto' };
      const mockResponse = { id: 1, ...dto };

      service.create.mockResolvedValue(mockResponse as any);

      const result = await controller.createTaxType(dto);

      expect(result).toEqual(mockResponse);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateTaxType', () => {
    it('should update a tax type (PATCH)', async () => {
      const dto = { name: 'Nuevo nombre' };
      const mockResponse = {
        id: 1,
        code: 'IVA',
        name: 'Nuevo nombre',
      };

      service.update.mockResolvedValue(mockResponse as any);

      const result = await controller.updateTaxType(1, dto as any);

      expect(result).toEqual(mockResponse);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('deleteTaxType', () => {
    it('should delete a tax type', async () => {
      service.delete.mockResolvedValue();

      await controller.deleteTaxType(1);

      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });
});