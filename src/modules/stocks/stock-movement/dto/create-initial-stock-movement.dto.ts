import {
  IsInt,
  IsEnum,
  Min,
  IsOptional,
  IsInt as IsIntAlias,
} from 'class-validator';

import { StockOperationType } from '../enums/stock-operation-type.enum';
import { StockFlow } from '../enums/stock-flow.enum';
import { StockReferenceType } from '../enums/stock-reference.enum';

export class CreateStockMovementDto {

  @IsInt() // 🔥 IsInt en lugar de IsNumber
  @Min(1)
  stockItemId: number;

  @IsEnum(StockOperationType)
  operationType: StockOperationType;

  @IsEnum(StockFlow)
  stockFlow: StockFlow;

  @IsInt() // 🔥 IsInt en lugar de IsNumber
  @Min(1)
  quantity: number;

  @IsEnum(StockReferenceType)
  referenceType: StockReferenceType;

  @IsOptional()
  @IsInt()
  @Min(1)
  referenceId?: number; // 🔥 faltaba — necesario para ORDER, PURCHASE_ORDER etc

  @IsOptional()
  @IsInt() // 🔥 note no existe en la entidad — sacarlo
  note?: never; // si querés notas agregalo a la entidad primero
}