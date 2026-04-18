import {
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  Min,
  IsIn,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
 
export class SearchShopDto {
 
  // ==========================
  // BÚSQUEDA
  // ==========================
 
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  search?: string;
 
  // ==========================
  // FILTROS
  // ==========================
 
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;          // 🔥 antes aceptaba 0, mínimo debe ser 1
 
  @IsOptional()
  @IsIn(['product', 'combo'])
  type?: 'product' | 'combo';
 
  // ==========================
  // FILTRO DE PRECIO
  // 🔥 antes tenía @IsInt() — precio es decimal
  // ==========================
 
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minPrice?: number;
 
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxPrice?: number;
 
  // ==========================
  // PAGINACIÓN
  // ==========================
 
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
 
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;          // 🔥 subido de 10 a 20 — más razonable para un shop
}