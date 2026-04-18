import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CalculateProductDto {

  @IsInt()
  @Min(1)
  productId: number;

  @IsOptional()
  @IsString()
  couponCode?: string;
}