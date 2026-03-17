import { Test, TestingModule } from '@nestjs/testing';
import { DiscountProductTargetService } from './discount-product-target.service';

describe('DiscountProductTargetService', () => {
  let service: DiscountProductTargetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscountProductTargetService],
    }).compile();

    service = module.get<DiscountProductTargetService>(DiscountProductTargetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
