import { IsOptional, IsString, IsEmail, MaxLength } from 'class-validator';

export class SearchUsersDto {

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  // busca por nombre completo (name + lastName)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}