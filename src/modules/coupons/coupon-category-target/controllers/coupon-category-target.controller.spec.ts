import { Test, TestingModule } from '@nestjs/testing';
import { CouponCategoryTargetController } from './coupon-category-target.controller';

describe('CouponCategoryTargetController', () => {
  let controller: CouponCategoryTargetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponCategoryTargetController],
    }).compile();

    controller = module.get<CouponCategoryTargetController>(CouponCategoryTargetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
