import { IsEnum, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { StockLocationType } from '../enums/stock-location-type.enum';

export class CreateStockLocationDto {

  @IsString()
  @MinLength(3) // 🔥 igual que el resto del proyecto
  @MaxLength(120)
  name: string;

  @IsEnum(StockLocationType)
  type: StockLocationType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;
}