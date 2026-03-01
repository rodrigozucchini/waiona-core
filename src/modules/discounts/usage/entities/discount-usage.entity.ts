import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/base.entity';
import { DiscountEntity } from '../../discount/entities/discounts.entity';
import { CouponEntity } from '../../coupon/entities/coupon.entity';

@Entity('discount_usages')
@Index(['discountId'])
@Index(['couponId'])
@Index(['orderId'])
@Index(['userId'])
export class DiscountUsageEntity extends BaseEntity {

  // FK al discount
  @Column({
    name: 'discount_id',
    type: 'int',
    nullable: false,
  })
  discountId: number;

  @ManyToOne(() => DiscountEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'discount_id' })
  discount: DiscountEntity;

  // FK opcional al cupón
  @Column({
    name: 'coupon_id',
    type: 'int',
    nullable: true,
  })
  couponId?: number;

  @ManyToOne(() => CouponEntity, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'coupon_id' })
  coupon?: CouponEntity;

  // Pedido donde se aplicó
  @Column({
    name: 'order_id',
    type: 'int',
    nullable: false,
  })
  orderId: number;

  // Usuario que lo usó
  @Column({
    name: 'user_id',
    type: 'int',
    nullable: false,
  })
  userId: number;

  @Column({
    name: 'amount_saved',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: false,
  })
  amountSaved: number;

  @Column({
    type: 'jsonb',
    nullable: false,
  })
  snapshot: Record<string, any>;

  @Column({
    name: 'applied_at',
    type: 'timestamp',
    nullable: false,
  })
  appliedAt: Date;
}