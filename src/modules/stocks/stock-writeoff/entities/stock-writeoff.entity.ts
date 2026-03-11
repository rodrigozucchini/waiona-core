import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

import { StockItemEntity } from '../../stock-item/entities/stock-item.entity';
import { StockMovementEntity } from '../../stock-movement/entities/stock-movement.entity';

import { StockWriteOffReason } from '../enums/stock-writeoff-reason.enum';

@Entity('stock_write_offs')
@Index(['stockItemId'])
@Index(['movementId'])
export class StockWriteOffEntity extends BaseEntity {

  @Column({
    name: 'stock_item_id',
    type: 'int',
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
  })
  quantity: number;

  @Column({
    type: 'enum',
    enum: StockWriteOffReason,
  })
  reason: StockWriteOffReason;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  attachments?: string[];

  @Column({
    name: 'reported_by',
    type: 'int',
  })
  reportedBy: number;
}