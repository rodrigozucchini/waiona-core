import { Test, TestingModule } from '@nestjs/testing';
import { DiscountsController } from './discounts.controller';
import { DiscountsService } from '../services/discounts.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { CurrencyCode } from 'src/common/enums/currency-code.enum';

describe('DiscountsController', () => {
  let controller: DiscountsController;
  let service: jest.Mocked<DiscountsService>;

  const mockService = () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  });

  const mockAuthGuard = { canActivate: jest.fn(() => true) };
  const mockRolesGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountsController],
      providers: [
        { provide: DiscountsService, useFactory: mockService },
        { provide: Reflector, useValue: { get: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<DiscountsController>(DiscountsController);
    service = module.get(DiscountsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockDiscountResponse = (overrides = {}) => ({
    id: 1,
    name: 'Descuento verano',
    description: null,
    value: 10,
    isPercentage: true,
    currency: null,
    startsAt: null,
    endsAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ==========================
  // create
  // ==========================

  describe('create', () => {
    it('should create a discount', async () => {
      const dto = { name: 'Descuento verano', value: 10, isPercentage: true };
      const discount = mockDiscountResponse();
      service.create.mockResolvedValue(discount as any);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(discount);
    });

    it('should create a fixed discount', async () => {
      const dto = { name: 'Descuento fijo', value: 100, isPercentage: false, currency: CurrencyCode.ARS };
      const discount = mockDiscountResponse({ value: 100, isPercentage: false, currency: CurrencyCode.ARS });
      service.create.mockResolvedValue(discount as any);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result.isPercentage).toBe(false);
    });
  });

  // ==========================
  // findAll
  // ==========================

  describe('findAll', () => {
    it('should return all discounts', async () => {
      const discounts = [mockDiscountResponse()];
      service.findAll.mockResolvedValue(discounts as any);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(discounts);
    });

    it('should return empty array if no discounts', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  // ==========================
  // findOne
  // ==========================

  describe('findOne', () => {
    it('should return a discount by id', async () => {
      const discount = mockDiscountResponse();
      service.findOne.mockResolvedValue(discount as any);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(discount);
    });
  });

  // ==========================
  // update
  // ==========================

  describe('update', () => {
    it('should update a discount', async () => {
      const dto = { name: 'Nuevo nombre' };
      const discount = mockDiscountResponse({ name: 'Nuevo nombre' });
      service.update.mockResolvedValue(discount as any);

      const result = await controller.update(1, dto as any);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result.name).toBe('Nuevo nombre');
    });
  });

  // ==========================
  // remove
  // ==========================

  describe('remove', () => {
    it('should remove a discount', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});