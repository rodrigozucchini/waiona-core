import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/base.entity';
import { CouponEntity } from '../../coupon/entities/coupon.entity';

@Entity('coupon_category_targets')
@Index(['couponId'])
@Index(['categoryId'])
export class CouponCategoryTargetEntity extends BaseEntity {

  @Column({
    name: 'coupon_id',
    type: 'int',
    nullable: false,
  })
  couponId: number;

  @ManyToOne(() => CouponEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'coupon_id' })
  coupon: CouponEntity;

  @Column({
    name: 'category_id',
    type: 'int',
    nullable: false,
  })
  categoryId: number;
}