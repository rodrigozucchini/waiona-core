import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './services/seed.service';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { ProfileEntity } from 'src/modules/users/entities/profile.entity';
import { RoleEntity } from 'src/modules/users/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ProfileEntity, RoleEntity])],
  providers: [SeedService],
})
export class SeedModule {}