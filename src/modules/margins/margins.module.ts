import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarginsController } from './controllers/margins.controller';
import { MarginsService } from './services/margins.service';
import { MarginEntity } from './entities/margin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarginEntity]),
  ],
  controllers: [MarginsController],
  providers: [MarginsService],
  exports: [MarginsService], // opcional, útil si otro módulo lo usa
})
export class MarginsModule {}