import { StockMovementEntity } from '../entities/stock-movement.entity';
import { StockOperationType } from '../enums/stock-operation-type.enum';
import { StockFlow } from '../enums/stock-flow.enum';
import { StockReferenceType } from '../enums/stock-reference.enum';

export class StockMovementResponseDto {

  id: number;
  stockItemId: number;
  operationType: StockOperationType;
  stockFlow: StockFlow;
  quantity: number;
  referenceType: StockReferenceType;
  referenceId?: number; // 🔥 agregado

  createdAt: Date;

  constructor(entity: StockMovementEntity) {
    this.id = entity.id;
    this.stockItemId = entity.stockItemId;
    this.operationType = entity.operationType;
    this.stockFlow = entity.stockFlow;
    this.quantity = entity.quantity;
    this.referenceType = entity.referenceType;
    this.referenceId = entity.referenceId ?? undefined; // 🔥 agregado
    this.createdAt = entity.createdAt;
  }
}