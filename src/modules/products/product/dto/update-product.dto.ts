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
  
  export class UpdateProductDto {
  
    @IsOptional()
    @IsString()
    @MaxLength(50)
    sku?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(150)
    name?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;
  
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
  
    @IsOptional()
    @IsEnum(ProductMeasurementUnit)
    measurementUnit?: ProductMeasurementUnit;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    measurementValue?: number;
  }