import { Test, TestingModule } from '@nestjs/testing';
import { ProductPricingController } from './product-pricing.controller';

describe('ProductPricingController', () => {
  let controller: ProductPricingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductPricingController],
    }).compile();

    controller = module.get<ProductPricingController>(ProductPricingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
