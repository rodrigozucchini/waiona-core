import { IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateProductImageDto {

  @IsOptional()
  @IsNumber()
  productId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  url?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  position?: number;
}