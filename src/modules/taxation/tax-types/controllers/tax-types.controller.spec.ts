import { Test, TestingModule } from '@nestjs/testing';
import { TaxTypesController } from './tax-types.controller';
import { TaxTypesService } from '../services/tax-types.service';

describe('TaxTypesController', () => {
  let controller: TaxTypesController;
  let service: jest.Mocked<TaxTypesService>;

  const mockService = () => ({
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxTypesController],
      providers: [
        {
          provide: TaxTypesService,
          useFactory: mockService,
        },
      ],
    }).compile();

    controller = module.get<TaxTypesController>(TaxTypesController);
    service = module.get(TaxTypesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockResponse = (overrides = {}) => ({
    id: 1,
    code: 'IVA',
    name: 'Impuesto',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('getTaxTypes', () => {
    it('should return all tax types', async () => {
      const data = [mockResponse()];

      service.findAll.mockResolvedValue(data);

      const result = await controller.getTaxTypes();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(data);
    });

    it('should return empty array', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.getTaxTypes();

      expect(result).toEqual([]);
    });
  });

  describe('findTaxType', () => {
    it('should return one tax type', async () => {
      const data = mockResponse();

      service.findById.mockResolvedValue(data);

      const result = await controller.findTaxType(1);

      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(data);
    });

    it('should call service with correct id type', async () => {
      service.findById.mockResolvedValue(mockResponse());

      await controller.findTaxType(1);

      expect(service.findById).toHaveBeenCalledWith(1);
    });

    it('should propagate errors from service', async () => {
      service.findById.mockRejectedValue(new Error('Not found'));

      await expect(controller.findTaxType(1)).rejects.toThrow(
        'Not found',
      );
    });
  });

  describe('createTaxType', () => {
    it('should create a tax type', async () => {
      const dto = { code: 'IVA', name: 'Impuesto' };
      const response = mockResponse(dto);

      service.create.mockResolvedValue(response);

      const result = await controller.createTaxType(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });

    it('should propagate errors from service', async () => {
      service.create.mockRejectedValue(new Error('Duplicate'));

      await expect(
        controller.createTaxType({} as any),
      ).rejects.toThrow('Duplicate');
    });
  });

  describe('updateTaxType', () => {
    it('should update a tax type', async () => {
      const dto = { name: 'New Name' };
      const response = mockResponse(dto);

      service.update.mockResolvedValue(response);

      const result = await controller.updateTaxType(
        1,
        dto as any,
      );

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(response);
    });

    it('should propagate errors from service', async () => {
      service.update.mockRejectedValue(new Error('Error'));

      await expect(
        controller.updateTaxType(1, {} as any),
      ).rejects.toThrow('Error');
    });
  });

  describe('deleteTaxType', () => {
    it('should delete a tax type', async () => {
      service.delete.mockResolvedValue(undefined);

      const result = await controller.deleteTaxType(1);

      expect(service.delete).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it('should propagate errors from service', async () => {
      service.delete.mockRejectedValue(new Error('Error'));

      await expect(
        controller.deleteTaxType(1),
      ).rejects.toThrow('Error');
    });
  });
});