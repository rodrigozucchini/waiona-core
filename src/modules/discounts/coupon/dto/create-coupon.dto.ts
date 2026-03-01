import {
    IsInt,
    IsEnum,
    IsString,
    IsOptional,
    IsBoolean,
    Min,
    IsDateString,
  } from 'class-validator';
  
  import { CouponType } from '../enums/coupon-type.enum';
  
  export class CreateCouponDto {
  
    @IsInt()
    @Min(1)
    discountId: number;
  
    @IsString()
    code: string;
  
    @IsEnum(CouponType)
    type: CouponType;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    userId?: number;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    usageLimit?: number;
  
    @IsOptional()
    @IsDateString()
    expiresAt?: Date;
  
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
  }