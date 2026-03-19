import { CategoryTaxEntity } from '../entities/category-taxes.entity';

export class CategoryTaxResponseDto {

  id: number;
  categoryId: number;
  taxId: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: CategoryTaxEntity) {
    this.id = entity.id;
    this.categoryId = entity.categoryId;
    this.taxId = entity.taxId;

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }

}