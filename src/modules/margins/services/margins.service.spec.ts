import { Test, TestingModule } from '@nestjs/testing';
import { MarginsService } from './margins.service';

describe('MarginsService', () => {
  let service: MarginsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarginsService],
    }).compile();

    service = module.get<MarginsService>(MarginsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
