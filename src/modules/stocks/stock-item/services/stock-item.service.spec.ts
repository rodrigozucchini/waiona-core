import { Test, TestingModule } from '@nestjs/testing';
import { StockItemsService } from '../services/stock-item.service';

describe('StockItemService', () => {
  let service: StockItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockItemsService],
    }).compile();

    service = module.get<StockItemsService>(StockItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
