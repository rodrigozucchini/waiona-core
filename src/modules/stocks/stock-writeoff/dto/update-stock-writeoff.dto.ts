import {
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
    IsArray,
  } from 'class-validator';
  
  import { StockWriteOffReason } from '../enums/stock-writeoff-reason.enum';
  
  export class UpdateStockWriteOffDto {
  
    @IsOptional()
    @IsEnum(StockWriteOffReason)
    reason?: StockWriteOffReason;
  
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    attachments?: string[];
  }