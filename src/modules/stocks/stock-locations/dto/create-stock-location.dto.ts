import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { StockLocationType } from '../enums/stock-location-type.enum';

export class CreateStockLocationDto {

  @IsString()
  @MaxLength(120)
  name: string;

  @IsEnum(StockLocationType)
  type: StockLocationType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;
}