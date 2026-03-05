import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateComboImageDto {
  @IsInt()
  @Min(1)
  comboId: number;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsInt()
  @Min(1)
  position: number;
}