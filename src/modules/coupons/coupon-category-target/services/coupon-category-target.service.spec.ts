import { Test, TestingModule } from '@nestjs/testing';
import { CouponCategoryTargetService } from './coupon-category-target.service';

describe('CouponCategoryTargetService', () => {
  let service: CouponCategoryTargetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CouponCategoryTargetService],
    }).compile();

    service = module.get<CouponCategoryTargetService>(CouponCategoryTargetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
