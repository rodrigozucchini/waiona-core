import { Test, TestingModule } from '@nestjs/testing';
import { DiscountComboTargetController } from './discount-combo-target.controller';

describe('DiscountComboTargetController', () => {
  let controller: DiscountComboTargetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountComboTargetController],
    }).compile();

    controller = module.get<DiscountComboTargetController>(DiscountComboTargetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
