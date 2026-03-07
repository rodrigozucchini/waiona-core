import {
    IsNumber,
    IsOptional,
    Min,
  } from 'class-validator';
  
  export class UpdateStockItemDto {
  
    // ==========================
    // Umbrales de stock
    // ==========================
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    stockMin?: number;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    stockCritical?: number;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    stockMax?: number;
  }