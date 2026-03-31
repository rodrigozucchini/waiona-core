import { Module } from '@nestjs/common';
import { CalculationService } from './calculation.service';
import { CalculationController } from './calculation.controller';

@Module({
  providers: [CalculationService],
  controllers: [CalculationController]
})
export class CalculationModule {}
