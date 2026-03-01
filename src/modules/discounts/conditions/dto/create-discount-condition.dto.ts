import {
    IsInt,
    IsEnum,
    IsOptional,
    IsNumber,
    IsObject,
    Min,
  } from 'class-validator';
  
  import { DiscountConditionType } from '../enums/discount-condition-type.enum';
  import { DiscountOperator } from '../enums/discount-operator.enum';
  
  export class CreateDiscountConditionDto {
  
    @IsInt()
    @Min(1)
    discountId: number;
  
    @IsEnum(DiscountConditionType)
    type: DiscountConditionType;
  
    @IsEnum(DiscountOperator)
    operator: DiscountOperator;
  
    @IsObject()
    value: Record<string, any>;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    qtyMin?: number;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    qtyMax?: number;
  
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    amountMin?: number;
  
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    amountMax?: number;
  }