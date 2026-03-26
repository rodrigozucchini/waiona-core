import { IsInt, Min } from 'class-validator';

export class StockItemWriteOffDto {

  @IsInt()
  @Min(1)
  stockItemId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}