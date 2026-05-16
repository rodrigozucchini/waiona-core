import {
    IsEmail,
    IsString,
    IsNotEmpty,
    IsOptional,
    IsUrl,
    Matches,
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
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    })
    password: string;

    // ==========================
    // Profile
    // ==========================

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    lastName: string;
  
    @IsOptional()
    @IsUrl()
    @MaxLength(255)
    avatar?: string;
  }