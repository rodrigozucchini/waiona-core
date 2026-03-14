import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductPricingEntity } from './entities/product-pricing.entity';
import { ComboPricingEntity } from './entities/combo-pricing.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductPricingEntity,
      ComboPricingEntity,
    ]),
  ],
})
export class PricingModule {}