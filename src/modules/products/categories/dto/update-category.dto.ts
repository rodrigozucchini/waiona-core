import {
    IsString,
    IsOptional,
    IsBoolean,
    IsInt,
    Min,
    MaxLength,
  } from 'class-validator';
  
  export class UpdateCategoryDto {
  
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;
  
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    parentId?: number | null;
  }