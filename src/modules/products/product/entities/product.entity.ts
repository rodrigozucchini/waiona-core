import {
  Entity,
  Column,
  OneToMany,
  Index,
} from 'typeorm';

import { BaseEntity } from '../../../../common/entities/base.entity';
import { ProductImageEntity } from '../../product-images/entities/product-image.entity';
import { ComboItemEntity } from '../../combos/entities/combo-item.entity';

@Entity('products')
@Index(['name'])
@Index(['isActive'])
export class ProductEntity extends BaseEntity {

  @Column({
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  description: string;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    nullable: false,
  })
  price: number;

  @Column({
    type: 'int',
    nullable: false,
  })
  stock: number;

  @Column({
    type: 'boolean',
    default: true,
    nullable: false,
  })
  isActive: boolean;

  // relación con imágenes
  @OneToMany(
    () => ProductImageEntity,
    (image) => image.product,
  )
  images: ProductImageEntity[];

  // relación con combos
  @OneToMany(
    () => ComboItemEntity,
    (item) => item.product,
  )
  comboItems: ComboItemEntity[];
}