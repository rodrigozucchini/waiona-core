import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/services/users.service';
import { UserEntity } from '../../users/entities/user.entity';
import { Payload } from '../models/payload.model';
import { RoleType } from 'src/common/enums/role-type.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Unauthorized');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Unauthorized');
    return user;
  }

  generateToken(user: UserEntity) {
    const payload: Payload = {
      sub: user.id,
      role: (user.role?.type as RoleType) ?? null, // 🔥 incluir rol en el token
    };
    return this.jwtService.sign(payload);
  }
}