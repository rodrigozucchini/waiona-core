import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateStockThresholdsDto {

  @IsOptional() // 🔥 todo opcional en update
  @IsInt()
  @Min(0)
  stockMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockCritical?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockMax?: number;
}