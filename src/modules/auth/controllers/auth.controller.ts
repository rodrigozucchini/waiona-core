import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from '../services/auth.service';
import { UserEntity } from '../../users/entities/user.entity';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { ForgotPasswordDto } from 'src/modules/mail/dto/forgot-password.dto';
import { ResetPasswordDto } from 'src/modules/mail/dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==========================
  // POST /auth/register
  // ==========================

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: CreateUserDto): Promise<{ message: string }> {
    await this.authService.register(dto);
    return { message: 'Registration successful — check your email to activate your account' };
  }

  // ==========================
  // GET /auth/activate?token=xxx
  // ==========================

  @Get('activate')
  @HttpCode(HttpStatus.OK)
  async activate(@Query('token') token: string): Promise<{ message: string }> {
    await this.authService.activateAccount(token);
    return { message: 'Account activated successfully' };
  }

  // ==========================
  // POST /auth/login
  // ==========================

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: Request) {
    const user = req.user as UserEntity;
    return {
      user,
      access_token: this.authService.generateToken(user),
    };
  }

  // ==========================
  // POST /auth/forgot-password
  // ==========================

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.authService.forgotPassword(dto.email);
    // siempre responder OK — no dar pistas sobre si el email existe
    return { message: 'If the email exists, you will receive a reset link shortly' };
  }

  // ==========================
  // POST /auth/reset-password
  // ==========================

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    await this.authService.resetPassword(dto);
    return { message: 'Password reset successfully' };
  }
}