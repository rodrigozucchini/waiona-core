import {
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateStockItemDto {

  // ==========================
  // RELACIONES
  // ==========================

  @IsInt() // 🔥 IsInt en lugar de IsNumber — son IDs
  @Min(1)
  productId: number;

  @IsInt()
  @Min(1)
  locationId: number;

  // ==========================
  // UMBRALES
  // ==========================

  @IsInt()
  @Min(0)
  stockMin: number;

  @IsInt()
  @Min(0)
  stockCritical: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockMax?: number;
}