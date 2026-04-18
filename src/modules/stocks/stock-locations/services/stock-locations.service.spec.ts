import { Test, TestingModule } from '@nestjs/testing';
import { StockLocationsService } from './stock-locations.service';

describe('StockLocationsService', () => {
  let service: StockLocationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockLocationsService],
    }).compile();

    service = module.get<StockLocationsService>(StockLocationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
