import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { BaseEntity } from '../../../../common/entities/base.entity';
import { StockLocationEntity } from '../../stock-locations/entities/stock-locations.entity';
import { ProductEntity } from 'src/modules/products/product/entities/product.entity';
import { StockMovementEntity } from '../../stock-movement/entities/stock-movement.entity';

@Entity('stock_items')
@Index(['productId', 'locationId'], { unique: true })
export class StockItemEntity extends BaseEntity {

  @Column({
    type: 'int',
    nullable: false,
  })
  productId: number;

  @ManyToOne(() => ProductEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column({
    type: 'int',
    nullable: false,
  })
  locationId: number;

  @ManyToOne(() => StockLocationEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'locationId' })
  location: StockLocationEntity;

  // =============================
  // STOCK
  // =============================

  @Column({
    type: 'int',
    default: 0,
  })
  quantityCurrent: number;

  @Column({
    type: 'int',
    default: 0,
  })
  quantityReserved: number;

  get quantityAvailable(): number {
    return this.quantityCurrent - this.quantityReserved;
  }

  // =============================
  // THRESHOLDS
  // =============================

  @Column({ type: 'int' })
  stockMin: number;

  @Column({ type: 'int' })
  stockCritical: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  stockMax?: number;

  // =============================
  // RELATIONS
  // =============================

  @OneToMany(
    () => StockMovementEntity,
    movement => movement.stockItem,
  )
  movements: StockMovementEntity[];
}