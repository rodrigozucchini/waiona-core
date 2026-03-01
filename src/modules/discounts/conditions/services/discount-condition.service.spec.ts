import { Test, TestingModule } from '@nestjs/testing';
import { DiscountConditionService } from './discount-condition.service';

describe('DiscountConditionService', () => {
  let service: DiscountConditionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscountConditionService],
    }).compile();

    service = module.get<DiscountConditionService>(DiscountConditionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
