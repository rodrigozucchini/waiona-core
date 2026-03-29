import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UserEntity } from 'src/modules/users/entities/user.entity';
import { ProfileEntity } from 'src/modules/users/entities/profile.entity';
import { RoleEntity } from 'src/modules/users/entities/role.entity';
import { RoleType } from 'src/common/enums/role-type.enum';
import { Env } from 'src/env.model';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(ProfileEntity)
    private readonly profileRepo: Repository<ProfileEntity>,

    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,

    private readonly configService: ConfigService<Env>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedSuperAdmin();
  }

  private async seedSuperAdmin() {
    // Verificar si ya existe el superadmin
    const existing = await this.userRepo.findOne({
      where: { role: { type: RoleType.SUPER_ADMIN } },
    });
    if (existing) return;

    // Crear o buscar el rol superadmin
    let role = await this.roleRepo.findOne({
      where: { type: RoleType.SUPER_ADMIN },
    });
    if (!role) {
      role = this.roleRepo.create({ type: RoleType.SUPER_ADMIN });
      role = await this.roleRepo.save(role);
    }

    // Crear profile
    const profile = this.profileRepo.create({
      name: 'Super',
      lastName: 'Admin',
    });

    // Crear usuario
    const email = this.configService.get('SUPERADMIN_EMAIL', { infer: true })!;
    const password = this.configService.get('SUPERADMIN_PASSWORD', { infer: true })!;

    const user = this.userRepo.create({
      email,
      password,
      profile,
      role,
    });

    await this.userRepo.save(user);
    console.log('✅ Superadmin created');
  }
}