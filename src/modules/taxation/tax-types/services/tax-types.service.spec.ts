import { Test, TestingModule } from '@nestjs/testing';
import { TaxTypesService } from './tax-types.service';

describe('TaxTypesService', () => {
  let service: TaxTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaxTypesService],
    }).compile();

    service = module.get<TaxTypesService>(TaxTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
