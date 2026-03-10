import {
    IsEnum,
    IsNumber,
    Min,
  } from 'class-validator';
  
  import { StockOperationType } from '../enums/stock-operation-type.enum';
  import { StockFlow } from '../enums/stock-flow.enum';
  import { StockReferenceType } from '../enums/stock-reference.enum';
  
  export class CreateInitialStockMovementDto {
  
    // ==========================
    // Relaciones
    // ==========================
  
    @IsNumber()
    stockItemId: number;
  
    // ==========================
    // Movimiento
    // ==========================
  
    @IsEnum(StockOperationType)
    operationType: StockOperationType;
  
    @IsEnum(StockFlow)
    stockFlow: StockFlow;
  
    @IsNumber()
    @Min(1)
    quantity: number;
  
    // ==========================
    // Referencia
    // ==========================
  
    @IsEnum(StockReferenceType)
    referenceType: StockReferenceType;
  
  }