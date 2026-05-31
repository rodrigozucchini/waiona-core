import {
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsDate,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCouponDto {
  @ApiProperty({ example: 'PROMO10' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  code: string;

  @ApiProperty({
    example: 10,
    minimum: 0.01,
    maximum: 100,
    description: 'Porcentaje de descuento. Mín 0.01, máx 100.',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100)
  value: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  isGlobal: boolean;

  @ApiProperty({ required: false, nullable: true, example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startsAt?: Date;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endsAt?: Date;
}
