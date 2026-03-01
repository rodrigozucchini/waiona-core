import { Test, TestingModule } from '@nestjs/testing';
import { DiscountConditionController } from './discount-condition.controller';

describe('DiscountConditionController', () => {
  let controller: DiscountConditionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountConditionController],
    }).compile();

    controller = module.get<DiscountConditionController>(DiscountConditionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
