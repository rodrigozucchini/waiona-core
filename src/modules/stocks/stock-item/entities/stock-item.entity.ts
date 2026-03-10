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

  // =============================
  // PRODUCT
  // =============================

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

  // =============================
  // LOCATION
  // =============================

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

  // stock físico real
  @Column({
    type: 'int',
    default: 0,
    nullable: false,
  })
  quantity: number;

  // stock reservado para órdenes
  @Column({
    type: 'int',
    default: 0,
    nullable: false,
  })
  quantityReserved: number;

  // stock disponible para vender
  get quantityAvailable(): number {
    return this.quantity - this.quantityReserved;
  }

  // =============================
  // STOCK THRESHOLDS
  // =============================

  @Column({
    type: 'int',
    nullable: false,
  })
  stockMin: number;

  @Column({
    type: 'int',
    nullable: false,
  })
  stockCritical: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  stockMax?: number;

  @OneToMany(
    () => StockMovementEntity,
    movement => movement.stockItem,
  )
  movements: StockMovementEntity[];
}