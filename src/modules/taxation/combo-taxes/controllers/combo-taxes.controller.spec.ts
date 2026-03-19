import { Test, TestingModule } from '@nestjs/testing';
import { ComboTaxesController } from './combo-taxes.controller';

describe('ComboTaxesController', () => {
  let controller: ComboTaxesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComboTaxesController],
    }).compile();

    controller = module.get<ComboTaxesController>(ComboTaxesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
