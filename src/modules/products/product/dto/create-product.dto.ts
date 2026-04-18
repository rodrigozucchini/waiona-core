import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  MaxLength,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

import { ProductMeasurementUnit } from '../enums/product-measurement-unit.enum';

export class CreateProductDto {

  // ==========================
  // Identificación
  // ==========================

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  sku: string;

  // ==========================
  // Información básica
  // ==========================

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  description: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // ==========================
  // Unidad de medida
  // ==========================

  @IsEnum(ProductMeasurementUnit)
  measurementUnit: ProductMeasurementUnit;

  @IsOptional()
  @IsNumber()
  @Min(0)
  measurementValue?: number;
}