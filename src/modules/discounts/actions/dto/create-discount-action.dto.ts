import {
    IsInt,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Min,
  } from 'class-validator';
  
  import { DiscountActionType } from '../enum/action-type.enum';
  import { AppliesToType } from '../enum/discount-action-type.enum';
  
  export class CreateDiscountActionDto {
  
    @IsInt()
    @Min(1)
    discountId: number;
  
    @IsEnum(DiscountActionType)
    type: DiscountActionType;
  
    @IsNumber({ maxDecimalPlaces: 2 })
    value: number;
  
    @IsOptional()
    @IsString()
    currency?: string;
  
    @IsEnum(AppliesToType)
    appliesTo: AppliesToType;
  
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    maxDiscount?: number;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    buyQty?: number;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    getQty?: number;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    freeProductId?: number;
  }