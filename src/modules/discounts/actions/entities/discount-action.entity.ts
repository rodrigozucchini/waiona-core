import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/base.entity';
import { DiscountEntity } from '../../discount/entities/discounts.entity';
import { DiscountActionType } from '../enum/action-type.enum';
import { AppliesToType } from '../enum/discount-action-type.enum';

@Entity('discount_actions')
@Index(['discountId'])
export class DiscountActionEntity extends BaseEntity {

  // FK explícita
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
    type: 'enum',
    enum: DiscountActionType,
    nullable: false,
  })
  type: DiscountActionType;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: false,
  })
  value: number;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  currency?: string;

  @Column({
    name: 'applies_to',
    type: 'enum',
    enum: AppliesToType,
    nullable: false,
  })
  appliesTo: AppliesToType;

  @Column({
    name: 'max_discount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  maxDiscount?: number;

  @Column({
    name: 'buy_qty',
    type: 'int',
    nullable: true,
  })
  buyQty?: number;

  @Column({
    name: 'get_qty',
    type: 'int',
    nullable: true,
  })
  getQty?: number;

  @Column({
    name: 'free_product_id',
    type: 'int',
    nullable: true,
  })
  freeProductId?: number;
}