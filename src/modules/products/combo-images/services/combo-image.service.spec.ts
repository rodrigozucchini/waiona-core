import { Test, TestingModule } from '@nestjs/testing';
import { ComboImageService } from './combo-image.service';

describe('ComboImageService', () => {
  let service: ComboImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComboImageService],
    }).compile();

    service = module.get<ComboImageService>(ComboImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
