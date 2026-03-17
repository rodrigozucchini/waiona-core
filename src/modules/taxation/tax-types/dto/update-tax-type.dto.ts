import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateTaxTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}