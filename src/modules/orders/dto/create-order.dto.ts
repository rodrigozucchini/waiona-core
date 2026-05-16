import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsArray,
    IsInt,
    IsBoolean,
    Min,
    Max,
    MaxLength,
    ArrayMinSize,
    ValidateNested,
    ValidateIf,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { DeliveryType } from '../enums/delivery-type.enum';
  
  export class CreateOrderItemDto {
  
    @ValidateIf(o => !o.comboId)
    @IsInt()
    @Min(1)
    productId?: number;

    @ValidateIf(o => !o.productId)
    @IsInt()
    @Min(1)
    comboId?: number;
  
    @IsInt()
    @Min(1)
    @Max(500)
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
    @IsNotEmpty()
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