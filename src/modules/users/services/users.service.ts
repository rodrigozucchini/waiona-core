import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { ProfileEntity } from '../entities/profile.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(ProfileEntity)
    private readonly profileRepo: Repository<ProfileEntity>,
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

    const user = this.userRepo.create({
      email: dto.email,
      password: dto.password,
      profile,
    });

    return this.userRepo.save(user);
  }

  /* =======================
      FIND
  ======================= */
  findAll() {
    return this.userRepo.find({
      where: { isDeleted: false },
    });
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({
      where: { email, isDeleted: false },
    });
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
}