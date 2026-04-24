import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UserEntity } from '../../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ==========================
  // POST /auth/login
  // ==========================

  @UseInterceptors(ClassSerializerInterceptor) // 🔥 activa @Exclude() en UserEntity → excluye password
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: Request) {
    const user = req.user as UserEntity;
    return {
      user,
      access_token: this.authService.generateToken(user),
    };
  }
}