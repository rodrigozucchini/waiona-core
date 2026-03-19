import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';

import { CategoryEntity } from 'src/modules/products/categories/entities/category.entity';
import { TaxEntity } from 'src/modules/taxation/taxes/entities/tax.entity';

@Entity('category_taxes')
@Index(['categoryId', 'taxId'], { unique: true })
export class CategoryTaxEntity extends BaseEntity {

  @Column({
    name: 'category_id',
    type: 'int',
  })
  categoryId: number;

  @ManyToOne(() => CategoryEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @Column({
    name: 'tax_id',
    type: 'int',
  })
  taxId: number;

  @ManyToOne(() => TaxEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tax_id' })
  tax: TaxEntity;

}