import { Test, TestingModule } from '@nestjs/testing';
import { ProductTaxesService } from './product-taxes.service';

describe('ProductTaxesService', () => {
  let service: ProductTaxesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductTaxesService],
    }).compile();

    service = module.get<ProductTaxesService>(ProductTaxesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
