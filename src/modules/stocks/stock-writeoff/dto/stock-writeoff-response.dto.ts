import { StockWriteOffEntity } from '../entities/stock-writeoff.entity';
import { StockWriteOffReason } from '../enums/stock-writeoff-reason.enum';

export class StockWriteOffResponseDto {

  id: number;
  stockItemId: number;
  movementId: number;
  quantity: number;
  reason: StockWriteOffReason;
  description?: string;
  attachments?: string[];
  reportedBy: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: StockWriteOffEntity) {
    this.id = entity.id;
    this.stockItemId = entity.stockItemId;
    this.movementId = entity.movementId;
    this.quantity = entity.quantity;
    this.reason = entity.reason;
    this.description = entity.description ?? undefined;
    this.attachments = entity.attachments ?? undefined;
    this.reportedBy = entity.reportedBy;

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}