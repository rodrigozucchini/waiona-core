import { Test, TestingModule } from '@nestjs/testing';
import { ProductTaxesController } from './product-taxes.controller';

describe('ProductTaxesController', () => {
  let controller: ProductTaxesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductTaxesController],
    }).compile();

    controller = module.get<ProductTaxesController>(ProductTaxesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
