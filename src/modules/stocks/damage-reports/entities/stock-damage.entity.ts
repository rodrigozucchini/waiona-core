import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

import { StockItemEntity } from '../../stock-item/entities/stock-item.entity';
import { StockMovementEntity } from '../../stock-movement/entities/stock-movement.entity';

import { DamageCondition } from '../enums/damage-condition.enum';

@Entity('stock_damages')
@Index(['stockItemId'])
@Index(['movementId'])
export class StockDamageEntity extends BaseEntity {

  @Column({
    name: 'stock_item_id',
    type: 'int',
    nullable: false,
  })
  stockItemId: number;

  @ManyToOne(() => StockItemEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'stock_item_id' })
  stockItem: StockItemEntity;

  @Column({
    name: 'movement_id',
    type: 'int',
    nullable: false,
  })
  movementId: number;

  @ManyToOne(() => StockMovementEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'movement_id' })
  movement: StockMovementEntity;

  @Column({
    type: 'int',
    nullable: false,
  })
  quantity: number;

  @Column({
    type: 'enum',
    enum: DamageCondition,
    nullable: false,
  })
  condition: DamageCondition;

  @Column({
    type: 'text',
    nullable: false,
  })
  reason: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  attachments?: string[];

  @Column({
    name: 'reported_by',
    type: 'int',
    nullable: false,
  })
  reportedBy: number;
}