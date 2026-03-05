import { Test, TestingModule } from '@nestjs/testing';
import { ComboImageController } from './combo-image.controller';

describe('ComboImageController', () => {
  let controller: ComboImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComboImageController],
    }).compile();

    controller = module.get<ComboImageController>(ComboImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
