import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateTaxTypeDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 20) // 👈 mínimo 2, máximo 20
  code: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 150) // 👈 mínimo 3, máximo 150
  name: string;
}