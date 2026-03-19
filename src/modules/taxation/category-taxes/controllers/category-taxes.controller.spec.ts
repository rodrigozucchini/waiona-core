import { Test, TestingModule } from '@nestjs/testing';
import { CategoryTaxesController } from './category-taxes.controller';

describe('CategoryTaxesController', () => {
  let controller: CategoryTaxesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryTaxesController],
    }).compile();

    controller = module.get<CategoryTaxesController>(CategoryTaxesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
