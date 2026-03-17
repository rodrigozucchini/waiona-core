import {
    IsString,
    MaxLength,
    IsBoolean,
    IsOptional,
    ValidateNested,
    ArrayMinSize,
    IsInt,
    Min,
  } from 'class-validator';
  
  import { Type } from 'class-transformer';
  
  class CreateComboItemDto {
  
    @IsInt()
    @Min(1)
    productId: number;
  
    @IsInt()
    @Min(1)
    quantity: number;
  }
  
  export class CreateComboDto {
  
    @IsString()
    @MaxLength(150)
    name: string;
  
    @IsString()
    @MaxLength(255)
    description: string;
  
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
  
    @ValidateNested({ each: true })
    @Type(() => CreateComboItemDto)
    @ArrayMinSize(1)
    items: CreateComboItemDto[];
  }