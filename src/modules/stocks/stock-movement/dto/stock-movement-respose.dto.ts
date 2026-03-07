import { StockMovementEntity } from '../entities/stock-movement.entity';

import { StockOperationType } from '../enums/stock-operation-type.enum';
import { StockFlow } from '../enums/stock-flow.enum';
import { StockReferenceType } from '../enums/stock-reference.enum';

export class StockMovementResponseDto {

  id: number;

  stockItemId: string;

  operationType: StockOperationType;

  stockFlow: StockFlow;

  quantity: number;

  quantityAfter: number;

  referenceType: StockReferenceType;

  referenceId?: string;

  createdAt: Date;

  constructor(entity: StockMovementEntity) {
    this.id = entity.id;

    this.stockItemId = entity.stockItemId;

    this.operationType = entity.operationType;
    this.stockFlow = entity.stockFlow;

    this.quantity = entity.quantity;
    this.quantityAfter = entity.quantityAfter;

    this.referenceType = entity.referenceType;
    this.referenceId = entity.referenceId;

    this.createdAt = entity.createdAt;
  }
}