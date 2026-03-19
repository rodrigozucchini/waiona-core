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
import { ComboTaxesModule } from './combo-taxes.module';
import { ComboTaxesModule } from './combo-taxes/combo-taxes.module';
import { ComboTaxesService } from './combo-taxes/services/combo-taxes.service';
import { ComboTaxesController } from './combo-taxes/controllers/combo-taxes.controller';
import { CategoryTaxesController } from './category-taxes/controllers/category-taxes.controller';
import { CategoryTaxesService } from './category-taxes/services/category-taxes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaxEntity,
      TaxTypeEntity,
    ]),
    ComboTaxesModule,
  ],
  controllers: [
    TaxesController,
    TaxTypesController,
    ComboTaxesController,
    CategoryTaxesController,
  ],
  providers: [
    TaxesService,
    TaxTypesService,
    ComboTaxesService,
    CategoryTaxesService,
  ],
  exports: [
    TaxesService,
    TaxTypesService,
  ],
})
export class TaxationModule {}