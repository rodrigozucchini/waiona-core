import { Test, TestingModule } from '@nestjs/testing';
import { ComboPricingService } from './combo-pricing.service';

describe('ComboPricingService', () => {
  let service: ComboPricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComboPricingService],
    }).compile();

    service = module.get<ComboPricingService>(ComboPricingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
