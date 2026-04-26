import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { ProfileEntity } from '../entities/profile.entity';
import { RoleEntity } from '../entities/role.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { SearchUsersDto } from '../dto/search-users.dto';
import { RoleType } from 'src/common/enums/role-type.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(ProfileEntity)
    private readonly profileRepo: Repository<ProfileEntity>,

    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
  ) {}

  /* =======================
      CREATE
  ======================= */
  async create(dto: CreateUserDto) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email, isDeleted: false },
    });
    if (existing) throw new ConflictException('Email already in use');

    const profile = this.profileRepo.create({
      name: dto.name,
      lastName: dto.lastName,
      avatar: dto.avatar ?? null,
    });

    // 🔥 asignar rol CLIENT automáticamente al registrarse
    const clientRole = await this.roleRepo.findOne({
      where: { type: RoleType.CLIENT },
    });

    const user = this.userRepo.create({
      email: dto.email,
      password: dto.password,
      profile,
      role: clientRole ?? undefined,
    });

    return this.userRepo.save(user);
  }

  /* =======================
      FIND
  ======================= */

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: { email, isDeleted: false },
    });
  }

  async findAll(dto?: SearchUsersDto) {

    const where: any = { isDeleted: false };

    if (dto?.email) {
      where.email = ILike(`%${dto.email}%`);
    }

    // buscar por nombre en el profile
    if (dto?.name) {
      return this.userRepo.find({
        where: [
          { isDeleted: false, profile: { name: ILike(`%${dto.name}%`) } },
          { isDeleted: false, profile: { lastName: ILike(`%${dto.name}%`) } },
        ],
      });
    }

    return this.userRepo.find({ where });
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /* =======================
      UPDATE
  ======================= */
  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    Object.assign(user.profile, {
      name: dto.name ?? user.profile.name,
      lastName: dto.lastName ?? user.profile.lastName,
      avatar: dto.avatar ?? user.profile.avatar,
    });

    return this.userRepo.save(user);
  }

  /* =======================
      DELETE (SOFT)
  ======================= */
  async remove(id: number) {
    const user = await this.findOne(id);
    user.isDeleted = true;
    user.profile.isDeleted = true;
    return this.userRepo.save(user);
  }

  /* =======================
      ACTIVATE
  ======================= */
  async activate(id: number): Promise<void> {
    await this.userRepo.update(id, { isActive: true });
  }

  /* =======================
      UPDATE PASSWORD
  ======================= */
  async updatePassword(id: number, newPassword: string): Promise<void> {
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update(id, { password: hashed });
  }
}