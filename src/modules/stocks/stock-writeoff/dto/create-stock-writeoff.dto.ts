import {
    IsInt,
    IsEnum,
    IsOptional,
    IsString,
    Min,
    MaxLength,
    IsArray,
  } from 'class-validator';
  
  import { StockWriteOffReason } from '../enums/stock-writeoff-reason.enum';
  
  export class CreateStockWriteOffDto {
  
    @IsInt()
    stockItemId: number;
  
    @IsInt()
    @Min(1)
    quantity: number;
  
    @IsEnum(StockWriteOffReason)
    reason: StockWriteOffReason;
  
    @IsString()
    @MaxLength(500)
    description: string;
  
    @IsOptional()
    @IsArray()
    attachments?: string[];
  
    @IsInt()
    reportedBy: number;
  }