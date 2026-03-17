import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateStockThresholdsDto {

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