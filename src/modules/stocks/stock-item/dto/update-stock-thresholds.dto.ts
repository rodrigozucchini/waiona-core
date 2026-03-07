import {
    IsNumber,
    Min,
  } from 'class-validator';
  
  export class UpdateStockThresholdsDto {
  
    // ==========================
    // Umbrales de stock
    // ==========================
  
    @IsNumber()
    @Min(0)
    stockMin: number;
  
    @IsNumber()
    @Min(0)
    stockCritical: number;
  
    @IsNumber()
    @Min(0)
    stockMax: number;
  }