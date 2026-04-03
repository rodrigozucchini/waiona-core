import {
    IsEnum,
    IsOptional,
    IsString,
    IsArray,
    IsInt,
    IsBoolean,
    Min,
    MaxLength,
    ArrayMinSize,
    ValidateNested,
    ValidateIf,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { DeliveryType } from '../enums/delivery-type.enum';
  
  export class CreateOrderItemDto {
  
    @IsOptional()
    @IsInt()
    @Min(1)
    productId?: number;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    comboId?: number;
  
    @IsInt()
    @Min(1)
    quantity: number;
  }
  
  export class CreateOrderDto {
  
    // ==========================
    // Items
    // ==========================
  
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];
  
    // ==========================
    // Entrega
    // ==========================
  
    @IsEnum(DeliveryType)
    deliveryType: DeliveryType;
  
    @ValidateIf(o => o.deliveryType === DeliveryType.DELIVERY)
    @IsString()
    @MaxLength(500)
    address?: string;
  
    // ==========================
    // Cupón
    // ==========================
  
    @IsOptional()
    @IsString()
    @MaxLength(100)
    couponCode?: string;
  
    // ==========================
    // Notas
    // ==========================
  
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
  }