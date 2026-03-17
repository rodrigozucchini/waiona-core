import { Test, TestingModule } from '@nestjs/testing';
import { DiscountActionsService } from './discount-actions.service';

describe('DiscountActionsService', () => {
  let service: DiscountActionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscountActionsService],
    }).compile();

    service = module.get<DiscountActionsService>(DiscountActionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
