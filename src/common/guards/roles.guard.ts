import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { UserEntity } from 'src/modules/users/entities/user.entity';
  import { RoleType } from 'src/common/enums/role-type.enum';
  
  @Injectable()
  export class RolesGuard implements CanActivate {
  
    constructor(
      private reflector: Reflector,
  
      @InjectRepository(UserEntity)
      private readonly userRepo: Repository<UserEntity>,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const requiredRoles = this.reflector.get<RoleType[]>('roles', context.getHandler())
        ?? this.reflector.get<RoleType[]>('roles', context.getClass());
  
      // Si no tiene @Roles() → ruta pública
      if (!requiredRoles || requiredRoles.length === 0) return true;
  
      const request = context.switchToHttp().getRequest();
      const payload = request.user as { sub: number };
  
      const user = await this.userRepo.findOne({
        where: { id: payload.sub, isDeleted: false },
        relations: ['role'],
      });
  
      if (!user || !user.role) {
        throw new ForbiddenException('Access denied');
      }
  
      const hasRole = requiredRoles.includes(user.role.type as RoleType);
  
      if (!hasRole) {
        throw new ForbiddenException('Access denied');
      }
  
      return true;
    }
  }