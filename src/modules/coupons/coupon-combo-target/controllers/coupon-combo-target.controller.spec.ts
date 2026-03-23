import { Test, TestingModule } from '@nestjs/testing';
import { CouponComboTargetController } from './coupon-combo-target.controller';

describe('CouponComboTargetController', () => {
  let controller: CouponComboTargetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponComboTargetController],
    }).compile();

    controller = module.get<CouponComboTargetController>(CouponComboTargetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
