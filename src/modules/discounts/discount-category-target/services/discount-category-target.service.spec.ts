import { Test, TestingModule } from '@nestjs/testing';
import { DiscountCategoryTargetService } from './discount-category-target.service';

describe('DiscountCategoryTargetService', () => {
  let service: DiscountCategoryTargetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscountCategoryTargetService],
    }).compile();

    service = module.get<DiscountCategoryTargetService>(DiscountCategoryTargetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
