import { Test, TestingModule } from '@nestjs/testing';
import { StockItemController } from './stock-item.controller';

describe('StockItemController', () => {
  let controller: StockItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockItemController],
    }).compile();

    controller = module.get<StockItemController>(StockItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
