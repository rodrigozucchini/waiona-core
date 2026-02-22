import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// taxes
import { TaxesController } from './taxes/controllers/taxes.controller';
import { TaxesService } from './taxes/services/taxes.service';
import { TaxEntity } from './taxes/entities/tax.entity';

// tax-types
import { TaxTypesController } from './tax-types/controllers/tax-types.controller';
import { TaxTypesService } from './tax-types/services/tax-types.service';
import { TaxTypeEntity } from './tax-types/entities/tax-types.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaxEntity,
      TaxTypeEntity,
    ]),
  ],
  controllers: [
    TaxesController,
    TaxTypesController,
  ],
  providers: [
    TaxesService,
    TaxTypesService,
  ],
  exports: [
    TaxesService,
    TaxTypesService,
  ],
})
export class TaxationModule {}