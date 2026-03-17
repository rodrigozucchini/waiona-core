import { Test, TestingModule } from '@nestjs/testing';
import { DiscountCategoryTargetController } from './discount-category-target.controller';

describe('DiscountCategoryTargetController', () => {
  let controller: DiscountCategoryTargetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountCategoryTargetController],
    }).compile();

    controller = module.get<DiscountCategoryTargetController>(DiscountCategoryTargetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
