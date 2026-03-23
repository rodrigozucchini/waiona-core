import {
    IsInt,
    IsOptional,
    IsNumber,
    IsObject,
    IsDateString,
    Min,
  } from 'class-validator';
  
  export class UpdateDiscountUsageDto {
  
    @IsOptional()
    @IsInt()
    @Min(1)
    discountId?: number;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    couponId?: number;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    orderId?: number;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    userId?: number;
  
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    amountSaved?: number;
  
    @IsOptional()
    @IsObject()
    snapshot?: Record<string, any>;
  
    @IsOptional()
    @IsDateString()
    appliedAt?: Date;
  }