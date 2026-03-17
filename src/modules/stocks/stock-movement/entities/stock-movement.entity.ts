import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { BaseAuditEntity } from 'src/common/entities/base.audit.entity';
import { StockItemEntity } from '../../stock-item/entities/stock-item.entity';

import { StockOperationType } from '../enums/stock-operation-type.enum';
import { StockFlow } from '../enums/stock-flow.enum';
import { StockReferenceType } from '../enums/stock-reference.enum';

@Entity('stock_movements')
@Index(['stockItemId'])
@Index(['operationType'])
@Index(['stockFlow'])
export class StockMovementEntity extends BaseAuditEntity {

  @Column({
    type: 'int',
    nullable: false,
  })
  stockItemId: number;
  
  @ManyToOne(
    () => StockItemEntity,
    { nullable: false }
  )
  @JoinColumn({ name: 'stockItemId' })
  stockItem: StockItemEntity;

  @Column({
    type: 'enum',
    enum: StockOperationType,
    nullable: false,
  })
  operationType: StockOperationType;

  @Column({
    type: 'enum',
    enum: StockFlow,
    nullable: false,
  })
  stockFlow: StockFlow;

  @Column({
    type: 'int',
    nullable: false,
  })
  quantity: number;


  @Column({
    type: 'enum',
    enum: StockReferenceType,
    nullable: false,
  })
  referenceType: StockReferenceType;

}