import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { DiscountComboTargetEntity } from '../entities/discount-combo-target.entity';
  import { CreateDiscountComboTargetDto } from '../dto/create-discount-combo-target.dto';
  import { UpdateDiscountComboTargetDto } from '../dto/update-discount-combo-target.dto';
  
  @Injectable()
  export class DiscountComboTargetService {
  
    constructor(
      @InjectRepository(DiscountComboTargetEntity)
      private readonly repo: Repository<DiscountComboTargetEntity>,
    ) {}
  
    async create(dto: CreateDiscountComboTargetDto) {
  
      const existing = await this.repo.findOne({
        where: {
          comboId: dto.comboId,
          isDeleted: false,
        },
      });
  
      if (existing) {
        throw new BadRequestException(
          'Combo already has an active discount',
        );
      }
  
      const entity = this.repo.create(dto);
      return this.repo.save(entity);
    }
  
    async update(id: number, dto: UpdateDiscountComboTargetDto) {
  
      const entity = await this.repo.findOne({
        where: { id, isDeleted: false },
      });
  
      if (!entity) {
        throw new NotFoundException('Discount combo target not found');
      }
  
      if (dto.comboId && dto.comboId !== entity.comboId) {
        const existing = await this.repo.findOne({
          where: {
            comboId: dto.comboId,
            isDeleted: false,
          },
        });
  
        if (existing) {
          throw new BadRequestException(
            'Combo already has an active discount',
          );
        }
      }
  
      Object.assign(entity, dto);
      return this.repo.save(entity);
    }
  
    async findAll() {
      return this.repo.find({
        where: { isDeleted: false },
      });
    }
  
    async findOne(id: number) {
      const entity = await this.repo.findOne({
        where: { id, isDeleted: false },
      });
  
      if (!entity) {
        throw new NotFoundException('Discount combo target not found');
      }
  
      return entity;
    }
  
    async findByCombo(comboId: number) {
      return this.repo.findOne({
        where: {
          comboId,
          isDeleted: false,
        },
      });
    }
  
    async remove(id: number) {
      const entity = await this.findOne(id);
  
      entity.isDeleted = true;
      return this.repo.save(entity);
    }
  }