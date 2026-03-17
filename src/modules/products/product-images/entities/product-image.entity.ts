import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { BaseEntity } from '../../../../common/entities/base.entity';
import { ProductEntity } from '../../product/entities/product.entity';

@Entity('product_images')
@Index(['productId'])
@Index(['productId', 'position'], { unique: true }) // 👈 evita posiciones duplicadas por producto
export class ProductImageEntity extends BaseEntity {

  // FK explícita
  @Column()
  productId: number;

  @ManyToOne(() => ProductEntity, {
    nullable: false,
    onDelete: 'RESTRICT', // porque usás soft delete
  })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  url: string;

  @Column({
    type: 'int',
    nullable: false,
  })
  position: number; // 👈 orden manual de las imágenes
}