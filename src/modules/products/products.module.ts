import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryEntity } from './categories/entities/category.entity';
import { CategoryService } from './categories/services/category.service';
import { CategoryController } from './categories/controllers/category.controller';
import { ProductService } from './product/product.service';
import { ProductController } from './product/product.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity]),
  ],
  providers: [CategoryService, ProductService],
  controllers: [CategoryController, ProductController],
  exports: [CategoryService],
})
export class ProductsModule {}