import { Test, TestingModule } from '@nestjs/testing';
import { DiscountComboTargetService } from './discount-combo-target.service';

describe('DiscountComboTargetService', () => {
  let service: DiscountComboTargetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscountComboTargetService],
    }).compile();

    service = module.get<DiscountComboTargetService>(DiscountComboTargetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
