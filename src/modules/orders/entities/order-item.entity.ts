import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { OrderEntity } from './order.entity';
import { ProductEntity } from 'src/modules/products/product/entities/product.entity';
import { ComboEntity } from 'src/modules/products/combos/entities/combo.entity';

@Entity('order_items')
export class OrderItemEntity extends BaseEntity {

  // ==========================
  // Orden
  // ==========================

  @ManyToOne(() => OrderEntity, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  // ==========================
  // Producto o Combo (uno de los dos)
  // ==========================

  @ManyToOne(() => ProductEntity, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product?: ProductEntity | null;

  @ManyToOne(() => ComboEntity, { nullable: true })
  @JoinColumn({ name: 'combo_id' })
  combo?: ComboEntity | null;

  // ==========================
  // Cantidad
  // ==========================

  @Column({ type: 'int', nullable: false })
  quantity: number;

  // ==========================
  // Precio snapshot al momento de la compra
  // ==========================

  @Column('decimal', {
    name: 'unit_price',
    precision: 12,
    scale: 2,
    transformer: { to: v => v, from: v => Number(v) },
  })
  unitPrice: number;

  @Column('decimal', {
    name: 'final_price',
    precision: 12,
    scale: 2,
    transformer: { to: v => v, from: v => Number(v) },
  })
  finalPrice: number;
}