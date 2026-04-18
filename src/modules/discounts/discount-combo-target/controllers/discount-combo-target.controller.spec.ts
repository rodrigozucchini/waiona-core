import { Test, TestingModule } from '@nestjs/testing';
import { DiscountComboTargetController } from './discount-combo-target.controller';
import { DiscountComboTargetService } from '../services/discount-combo-target.service';

describe('DiscountComboTargetController', () => {
  let controller: DiscountComboTargetController;
  let service: jest.Mocked<DiscountComboTargetService>;

  const mockService = () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountComboTargetController],
      providers: [
        {
          provide: DiscountComboTargetService,
          useFactory: mockService,
        },
      ],
    }).compile();

    controller = module.get<DiscountComboTargetController>(DiscountComboTargetController);
    service = module.get(DiscountComboTargetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockTargetResponse = (overrides = {}) => ({
    id: 1,
    discountId: 1,
    comboId: 1,
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
    it('should create a combo target', async () => {
      const dto = { comboId: 1 };
      const target = mockTargetResponse();

      service.create.mockResolvedValue(target as any);

      const result = await controller.create(1, dto as any);

      expect(service.create).toHaveBeenCalledWith(1, dto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(target);
    });

    it('should propagate error from service', async () => {
      service.create.mockRejectedValue(new Error('boom'));

      await expect(
        controller.create(1, { comboId: 1 } as any),
      ).rejects.toThrow('boom');
    });
  });

  // ==========================
  // findAll
  // ==========================

  describe('findAll', () => {
    it('should return all combo targets for a discount', async () => {
      const targets = [mockTargetResponse()];

      service.findAll.mockResolvedValue(targets as any);

      const result = await controller.findAll(1);

      expect(service.findAll).toHaveBeenCalledWith(1);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(targets);
    });

    it('should return empty array if no targets', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll(1);

      expect(result).toEqual([]);
    });

    it('should propagate error from service', async () => {
      service.findAll.mockRejectedValue(new Error('boom'));

      await expect(controller.findAll(1)).rejects.toThrow('boom');
    });
  });

  // ==========================
  // remove
  // ==========================

  describe('remove', () => {
    it('should remove a combo target', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1, 1);

      expect(service.remove).toHaveBeenCalledWith(1, 1);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should propagate error from service', async () => {
      service.remove.mockRejectedValue(new Error('boom'));

      await expect(controller.remove(1, 1)).rejects.toThrow('boom');
    });
  });
});