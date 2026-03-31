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
import { ComboTaxesService } from './combo-taxes/services/combo-taxes.service';
import { ComboTaxesController } from './combo-taxes/controllers/combo-taxes.controller';
import { ProductTaxEntity } from './product-taxes/entities/product-taxes.entity';
import { ComboTaxEntity } from './combo-taxes/entities/combo.-taxes.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaxEntity,
      TaxTypeEntity,
      ProductTaxEntity,
      ComboTaxEntity,
    ]),
  ],
  controllers: [
    TaxesController,
    TaxTypesController,
    ComboTaxesController,
  ],
  providers: [
    TaxesService,
    TaxTypesService,
    ComboTaxesService,
  ],
  exports: [
    TaxesService,
    TaxTypesService,
  ],
})
export class TaxationModule {}