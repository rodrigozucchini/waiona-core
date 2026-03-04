import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryEntity } from './categories/entities/category.entity';
import { ProductEntity } from './product/entities/product.entity';
import { ComboEntity } from './combos/entities/combo.entity';
import { ComboItemEntity } from './combos/entities/combo-item.entity';

import { CategoryService } from './categories/services/category.service';
import { ProductService } from './product/services/product.service';
import { ComboService } from './combos/services/combo.service';

import { CategoryController } from './categories/controllers/category.controller';
import { ProductController } from './product/controllers/product.controller';
import { ComboController } from './combos/controllers/combo.controller';
import { ProductImageEntity } from './product-images/entities/product-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CategoryEntity,
      ProductEntity,
      ComboEntity,
      ComboItemEntity,
      ProductImageEntity,
    ]),
  ],
  providers: [
    CategoryService,
    ProductService,
    ComboService,
  ],
  controllers: [
    CategoryController,
    ProductController,
    ComboController,
  ],
  exports: [
    CategoryService,
    ProductService,
    ComboService,
  ],
})
export class ProductsModule {}