import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/base.entity';
import { CouponEntity } from '../../coupon/entities/coupon.entity';

@Entity('coupon_usages')
@Index(['couponId'])
@Index(['orderId'])
@Index(['userId'])
export class CouponUsageEntity extends BaseEntity {

  @Column({
    name: 'coupon_id',
    type: 'int',
    nullable: false,
  })
  couponId: number;

  @ManyToOne(() => CouponEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'coupon_id' })
  coupon: CouponEntity;

  // 🔥 referencia lógica — OrderEntity no existe aún
  @Column({
    name: 'order_id',
    type: 'int',
    nullable: false,
  })
  orderId: number;

  // 🔥 referencia lógica — UserEntity no existe aún
  @Column({
    name: 'user_id',
    type: 'int',
    nullable: false,
  })
  userId: number;

  @Column({
    name: 'applied_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  appliedAt: Date;
}