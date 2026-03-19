import { Test, TestingModule } from '@nestjs/testing';
import { ComboTaxesService } from './combo-taxes.service';

describe('ComboTaxesService', () => {
  let service: ComboTaxesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComboTaxesService],
    }).compile();

    service = module.get<ComboTaxesService>(ComboTaxesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
