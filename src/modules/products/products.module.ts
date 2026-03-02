import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryEntity } from './categories/entities/category.entity';
import { CategoryService } from './categories/services/category.service';
import { CategoryController } from './categories/controllers/category.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity]),
  ],
  providers: [CategoryService],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class ProductsModule {}