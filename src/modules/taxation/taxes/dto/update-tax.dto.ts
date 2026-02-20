import {
    IsInt,
    IsPositive,
    Min,
    Max,
    IsNumber,
    IsBoolean,
  } from 'class-validator';
  
  export class UpdateTaxDto {
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