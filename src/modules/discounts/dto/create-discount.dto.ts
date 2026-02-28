import {
    IsString,
    MaxLength,
    IsEnum,
    IsBoolean,
    IsOptional,
    IsInt,
    Min,
    IsDateString,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { DiscountStatus } from '../enums/discount-status.enum';
  
  export class CreateDiscountDto {
    @IsString()
    @MaxLength(100)
    name: string;
  
    @IsString()
    @MaxLength(255)
    description: string;
  
    @IsOptional()
    @IsEnum(DiscountStatus)
    status?: DiscountStatus;
  
    @IsOptional()
    @IsBoolean()
    exclusive?: boolean;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    usageLimit?: number;
  
    @IsOptional()
    @IsDateString()
    startsAt?: Date;
  
    @IsOptional()
    @IsDateString()
    endAt?: Date;
  }