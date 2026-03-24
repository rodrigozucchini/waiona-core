import { IsInt, IsString, Min, MinLength, MaxLength } from 'class-validator';

export class CreateCouponUsageDto {

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  code: string;

  @IsInt()
  @Min(1)
  orderId: number;

  @IsInt()
  @Min(1)
  userId: number; // 🔥 temporal — cuando haya auth viene del token
}