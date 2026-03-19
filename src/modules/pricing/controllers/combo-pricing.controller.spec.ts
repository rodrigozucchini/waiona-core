import { Test, TestingModule } from '@nestjs/testing';
import { ComboPricingController } from './combo-pricing.controller';

describe('ComboPricingController', () => {
  let controller: ComboPricingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComboPricingController],
    }).compile();

    controller = module.get<ComboPricingController>(ComboPricingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
