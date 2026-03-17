import { IsInt, IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateProductImageDto {

  @IsNumber()
  productId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  url: string;

  @IsInt()
  @Min(1)
  position: number; // 👈 empieza en 1
}