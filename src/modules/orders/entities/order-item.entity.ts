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
  // Ubicación de stock reservada (solo para items de producto)
  // Permite que dispatch/release usen la ubicación exacta sin re-query
  // ==========================

  @Column({ name: 'location_id', type: 'int', nullable: true, default: null })
  locationId?: number | null;

  // ==========================
  // Reservas de stock por componente (solo para combos)
  // Persiste { productId, locationId, quantity } de cada producto del combo
  // para que dispatch/release usen la ubicación exacta donde se reservó
  // ==========================

  @Column({ name: 'combo_reservations', type: 'jsonb', nullable: true, default: null })
  comboReservations?: { productId: number; locationId: number; quantity: number }[] | null;

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