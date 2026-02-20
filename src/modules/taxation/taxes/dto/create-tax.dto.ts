import {
    IsBoolean,
    IsNumber,
    IsPositive,
    Min,
    Max,
    IsInt,
  } from 'class-validator';
  
  export class CreateTaxDto {
    @IsInt()
    @IsPositive()
    taxTypeId: number; // ID del tipo de impuesto
  
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(100)
    value: number; // valor del impuesto, por ejemplo 21.00%
  
    @IsBoolean()
    isPercentage: boolean; // true = porcentaje, false = monto fijo
  }