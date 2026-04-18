import { Test, TestingModule } from '@nestjs/testing';
import { StockWriteOffController } from './stock-writeoff.controller';

describe('StockWriteoffController', () => {
  let controller: StockWriteOffController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockWriteOffController],
    }).compile();

    controller = module.get<StockWriteOffController>(StockWriteOffController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
