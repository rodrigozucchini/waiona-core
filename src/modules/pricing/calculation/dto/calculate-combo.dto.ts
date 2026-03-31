import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CalculateComboDto {

  @IsInt()
  @Min(1)
  comboId: number;

  @IsOptional()
  @IsString()
  couponCode?: string;
}