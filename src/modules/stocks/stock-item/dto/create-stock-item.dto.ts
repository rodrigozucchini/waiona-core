import {
    IsNumber,
    IsOptional,
    Min,
  } from 'class-validator';
  
  export class CreateStockItemDto {
  
    // ==========================
    // Relaciones
    // ==========================
  
    @IsNumber()
    productId: number;
  
    @IsNumber()
    locationId: number;
  
    // ==========================
    // Estado del stock
    // ==========================
  
    @IsNumber()
    @Min(0)
    quantityCurrent: number;
  
    // ==========================
    // Umbrales de stock
    // ==========================
  
    @IsNumber()
    @Min(0)
    stockMin: number;
  
    @IsNumber()
    @Min(0)
    stockCritical: number;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    stockMax?: number;
  }