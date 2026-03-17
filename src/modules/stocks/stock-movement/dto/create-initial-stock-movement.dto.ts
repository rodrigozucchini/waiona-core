import {
  IsNumber,
  IsEnum,
  Min,
  IsOptional,
  IsString,
} from 'class-validator';

import { StockOperationType } from '../enums/stock-operation-type.enum';
import { StockFlow } from '../enums/stock-flow.enum';
import { StockReferenceType } from '../enums/stock-reference.enum';

export class CreateStockMovementDto {

  @IsNumber()
  stockItemId: number;

  @IsEnum(StockOperationType)
  operationType: StockOperationType;

  @IsEnum(StockFlow)
  stockFlow: StockFlow;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsEnum(StockReferenceType)
  referenceType: StockReferenceType;

  @IsOptional()
  @IsString()
  note?: string;
}