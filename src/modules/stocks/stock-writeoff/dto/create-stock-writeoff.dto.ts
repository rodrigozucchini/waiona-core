import {
  IsInt,
  IsEnum,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  IsArray,
} from 'class-validator';

import { StockWriteOffReason } from '../enums/stock-writeoff-reason.enum';

export class CreateStockWriteOffDto {

  @IsInt()
  @Min(1) // 🔥 faltaba
  stockItemId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsEnum(StockWriteOffReason)
  reason: StockWriteOffReason;

  @IsOptional() // 🔥 opcional — consistente con la entidad
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // 🔥 validar que cada elemento sea string
  attachments?: string[];

  @IsInt()
  @Min(1) // 🔥 faltaba
  reportedBy: number;
}