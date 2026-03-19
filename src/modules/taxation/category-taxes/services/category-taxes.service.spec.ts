import { Test, TestingModule } from '@nestjs/testing';
import { CategoryTaxesService } from './category-taxes.service';

describe('CategoryTaxesService', () => {
  let service: CategoryTaxesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryTaxesService],
    }).compile();

    service = module.get<CategoryTaxesService>(CategoryTaxesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
