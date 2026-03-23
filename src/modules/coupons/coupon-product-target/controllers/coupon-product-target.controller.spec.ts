import { Test, TestingModule } from '@nestjs/testing';
import { CouponProductTargetController } from './coupon-product-target.controller';

describe('CouponProductTargetController', () => {
  let controller: CouponProductTargetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponProductTargetController],
    }).compile();

    controller = module.get<CouponProductTargetController>(CouponProductTargetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
