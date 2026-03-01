import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/base.entity';
import { DiscountEntity } from '../../discount/entities/discounts.entity';
import { CouponType } from '../enums/coupon-type.enum';

@Entity('coupons')
@Index(['code'], { unique: true })
@Index(['discountId'])
@Index(['userId'])
export class CouponEntity extends BaseEntity {

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

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    unique: true,
  })
  code: string;

  @Column({
    type: 'enum',
    enum: CouponType,
    nullable: false,
  })
  type: CouponType;

  // Si el cupón es específico para un usuario
  @Column({
    name: 'user_id',
    type: 'int',
    nullable: true,
  })
  userId?: number;

  @Column({
    name: 'usage_limit',
    type: 'int',
    nullable: true,
  })
  usageLimit?: number;

  @Column({
    name: 'usage_count',
    type: 'int',
    nullable: false,
    default: 0,
  })
  usageCount: number;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
    nullable: true,
  })
  expiresAt?: Date;

  @Column({
    name: 'is_active',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  isActive: boolean;
}