import { Test, TestingModule } from '@nestjs/testing';
import { TaxTypesController } from './tax-types.controller';

describe('TaxTypesController', () => {
  let controller: TaxTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxTypesController],
    }).compile();

    controller = module.get<TaxTypesController>(TaxTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
