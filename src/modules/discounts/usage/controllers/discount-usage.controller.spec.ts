import { Test, TestingModule } from '@nestjs/testing';
import { DiscountUsageController } from './discount-usage.controller';

describe('DiscountUsageController', () => {
  let controller: DiscountUsageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountUsageController],
    }).compile();

    controller = module.get<DiscountUsageController>(DiscountUsageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
