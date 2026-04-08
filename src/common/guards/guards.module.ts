import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [RolesGuard],
  exports: [RolesGuard, TypeOrmModule],
})
export class GuardsModule {}