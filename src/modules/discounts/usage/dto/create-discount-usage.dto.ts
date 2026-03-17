import {
    IsInt,
    IsOptional,
    IsNumber,
    IsObject,
    IsDateString,
    Min,
  } from 'class-validator';
  
  export class CreateDiscountUsageDto {
  
    @IsInt()
    @Min(1)
    discountId: number;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    couponId?: number;
  
    @IsInt()
    @Min(1)
    orderId: number;
  
    @IsInt()
    @Min(1)
    userId: number;
  
    @IsNumber({ maxDecimalPlaces: 2 })
    amountSaved: number;
  
    @IsObject()
    snapshot: Record<string, any>;
  
    @IsDateString()
    appliedAt: Date;
  }