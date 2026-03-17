import { Module } from '@nestjs/common';
import { ProductTaxesController } from './controllers/product-taxes.controller'
import { ProductTaxesService } from './services/product-taxes.service';

@Module({
  controllers: [ProductTaxesController],
  providers: [ProductTaxesService]
})
export class ProductTaxesModule {}
