import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/base.entity';
import { DiscountEntity } from '../../discount/entities/discounts.entity';
import { DiscountConditionType } from '../enums/discount-condition-type.enum';
import { DiscountOperator } from '../enums/discount-operator.enum';

@Entity('discount_conditions')
@Index(['discountId'])
export class DiscountConditionEntity extends BaseEntity {

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
    enum: DiscountConditionType,
    nullable: false,
  })
  type: DiscountConditionType;

  @Column({
    type: 'enum',
    enum: DiscountOperator,
    nullable: false,
  })
  operator: DiscountOperator;

  @Column({
    type: 'jsonb',
    nullable: false,
  })
  value: Record<string, any>;

  @Column({
    name: 'qty_min',
    type: 'int',
    nullable: true,
  })
  qtyMin?: number;

  @Column({
    name: 'qty_max',
    type: 'int',
    nullable: true,
  })
  qtyMax?: number;

  @Column({
    name: 'amount_min',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  amountMin?: number;

  @Column({
    name: 'amount_max',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  amountMax?: number;
}