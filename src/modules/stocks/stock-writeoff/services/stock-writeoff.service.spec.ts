import { Test, TestingModule } from '@nestjs/testing';
import { StockWriteoffService } from './stock-writeoff.service';

describe('StockWriteoffService', () => {
  let service: StockWriteoffService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockWriteoffService],
    }).compile();

    service = module.get<StockWriteoffService>(StockWriteoffService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
