import { Test, TestingModule } from '@nestjs/testing';
import { StockLocationsController } from './stock-locations.controller';

describe('StockLocationsController', () => {
  let controller: StockLocationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockLocationsController],
    }).compile();

    controller = module.get<StockLocationsController>(StockLocationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
