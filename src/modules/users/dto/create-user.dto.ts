import {
    IsEmail,
    IsString,
    IsOptional,
    IsUrl,
    MinLength,
    MaxLength,
  } from 'class-validator';
  
  export class CreateUserDto {
  
    // ==========================
    // Auth
    // ==========================
  
    @IsEmail()
    email: string;
  
    @IsString()
    @MinLength(8)
    @MaxLength(255)
    password: string;
  
    // ==========================
    // Profile
    // ==========================
  
    @IsString()
    @MaxLength(255)
    name: string;
  
    @IsString()
    @MaxLength(255)
    lastName: string;
  
    @IsOptional()
    @IsUrl()
    @MaxLength(255)
    avatar?: string;
  }