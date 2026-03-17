import {
    IsString,
    IsBoolean,
    IsOptional,
    IsEnum,
    IsNumber,
    Min,
    MaxLength,
  } from 'class-validator';
  
  import { ProductMeasurementUnit } from '../enums/product-measurement-unit.enum';
  
  export class CreateProductDto {
  
    // ==========================
    // Identificación
    // ==========================
  
    @IsString()
    @MaxLength(50)
    sku: string;
  
    // ==========================
    // Información básica
    // ==========================
  
    @IsString()
    @MaxLength(150)
    name: string;
  
    @IsString()
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