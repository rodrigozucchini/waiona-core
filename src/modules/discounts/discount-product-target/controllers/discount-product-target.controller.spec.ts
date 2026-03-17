import { Test, TestingModule } from '@nestjs/testing';
import { DiscountProductTargetController } from './discount-product-target.controller';

describe('DiscountProductTargetController', () => {
  let controller: DiscountProductTargetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountProductTargetController],
    }).compile();

    controller = module.get<DiscountProductTargetController>(DiscountProductTargetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
