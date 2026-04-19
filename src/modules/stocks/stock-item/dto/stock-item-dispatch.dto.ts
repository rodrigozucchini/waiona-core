import { IsInt, Min } from 'class-validator';
 
export class StockDispatchDto {
 
  @IsInt()
  @Min(1)
  productId: number;
 
  @IsInt()
  @Min(1)
  locationId: number;
 
  @IsInt()
  @Min(1)
  quantity: number;
 
  @IsInt()
  @Min(1)
  orderId: number;
}
