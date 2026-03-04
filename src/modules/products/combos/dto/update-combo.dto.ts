import {
    IsString,
    MaxLength,
    IsBoolean,
    IsOptional,
    ValidateNested,
    IsInt,
    Min,
  } from 'class-validator';
  
  import { Type } from 'class-transformer';
  
  class UpdateComboItemDto {
  
    @IsInt()
    @Min(1)
    productId: number;
  
    @IsInt()
    @Min(1)
    quantity: number;
  }
  
  export class UpdateComboDto {
  
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
    @ValidateNested({ each: true })
    @Type(() => UpdateComboItemDto)
    items?: UpdateComboItemDto[];
  }