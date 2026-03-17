import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { BaseEntity } from '../../../../common/entities/base.entity';
import { ComboEntity } from './combo.entity';
import { ProductEntity } from '../../product/entities/product.entity';

@Entity('combo_items')
@Index(['comboId'])
@Index(['productId'])
@Index(['comboId', 'productId'], { unique: true }) // evita duplicados
export class ComboItemEntity extends BaseEntity {

  // ==========================
  // Foreign Keys
  // ==========================

  @Column({
    type: 'int',
    nullable: false,
  })
  comboId: number;

  @Column({
    type: 'int',
    nullable: false,
  })
  productId: number;

  // ==========================
  // Relaciones
  // ==========================

  @ManyToOne(() => ComboEntity, {
    nullable: false,
    onDelete: 'RESTRICT', // compatible con soft delete
  })
  @JoinColumn({ name: 'comboId' })
  combo: ComboEntity;

  @ManyToOne(() => ProductEntity, {
    nullable: false,
    onDelete: 'RESTRICT', // compatible con soft delete
  })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  // ==========================
  // Cantidad del producto en el combo
  // ==========================

  @Column({
    type: 'int',
    nullable: false,
  })
  quantity: number;
}