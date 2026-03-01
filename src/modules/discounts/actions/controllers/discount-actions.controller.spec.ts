import { Test, TestingModule } from '@nestjs/testing';
import { DiscountActionsController } from './discount-actions.controller';

describe('DiscountActionsController', () => {
  let controller: DiscountActionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountActionsController],
    }).compile();

    controller = module.get<DiscountActionsController>(DiscountActionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
