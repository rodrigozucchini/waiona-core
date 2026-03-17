import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/base.entity';
import { DiscountEntity } from '../../discount/entities/discounts.entity';

@Entity('discount_category_targets')
@Index(['discountId'])
@Index(['categoryId'])
export class DiscountCategoryTargetEntity extends BaseEntity {

  @Column({
    name: 'discount_id',
    type: 'int',
    nullable: false,
  })
  discountId: number;

  @ManyToOne(() => DiscountEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'discount_id' })
  discount: DiscountEntity;

  @Column({
    name: 'category_id',
    type: 'int',
    nullable: false,
  })
  categoryId: number;
}