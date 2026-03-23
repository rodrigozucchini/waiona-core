import { Test, TestingModule } from '@nestjs/testing';
import { CouponProductTargetService } from './coupon-product-target.service';

describe('CouponProductTargetService', () => {
  let service: CouponProductTargetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CouponProductTargetService],
    }).compile();

    service = module.get<CouponProductTargetService>(CouponProductTargetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
