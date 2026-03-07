import {
    IsNumber,
    IsOptional,
    Min,
  } from 'class-validator';
  
  export class QueryStockItemsDto {
  
    // ==========================
    // Filtros
    // ==========================
  
    @IsOptional()
    @IsNumber()
    productId?: number;
  
    @IsOptional()
    @IsNumber()
    locationId?: number;
  
    // ==========================
    // Paginación
    // ==========================
  
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number;
  
    @IsOptional()
    @IsNumber()
    @Min(1)
    limit?: number;
  }