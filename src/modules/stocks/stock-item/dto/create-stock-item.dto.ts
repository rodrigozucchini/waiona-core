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
  // Umbrales
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