import { Test, TestingModule } from '@nestjs/testing';
import { CouponComboTargetService } from './coupon-combo-target.service';

describe('CouponComboTargetService', () => {
  let service: CouponComboTargetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CouponComboTargetService],
    }).compile();

    service = module.get<CouponComboTargetService>(CouponComboTargetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
