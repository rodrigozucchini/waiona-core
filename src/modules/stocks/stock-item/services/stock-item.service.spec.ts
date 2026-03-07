import { Test, TestingModule } from '@nestjs/testing';
import { StockItemService } from './stock-item.service';

describe('StockItemService', () => {
  let service: StockItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockItemService],
    }).compile();

    service = module.get<StockItemService>(StockItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
