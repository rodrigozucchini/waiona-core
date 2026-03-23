import { Test, TestingModule } from '@nestjs/testing';
import { DiscountUsageService } from './discount-usage.service';

describe('DiscountUsageService', () => {
  let service: DiscountUsageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscountUsageService],
    }).compile();

    service = module.get<DiscountUsageService>(DiscountUsageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
