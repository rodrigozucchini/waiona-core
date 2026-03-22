import { IsString, IsNotEmpty, Length } from 'class-validator';

export class UpdateTaxTypeDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  code: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  name: string;
}