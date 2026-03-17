import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { DiscountCategoryTargetEntity } from '../entities/discount-category-target.entity';
  import { CreateDiscountCategoryTargetDto } from '../dto/create-discount-category-target.dto';
  import { UpdateDiscountCategoryTargetDto } from '../dto/update-discount-category-target.dto';
  
  @Injectable()
  export class DiscountCategoryTargetService {
  
    constructor(
      @InjectRepository(DiscountCategoryTargetEntity)
      private readonly repo: Repository<DiscountCategoryTargetEntity>,
    ) {}
  
    async create(dto: CreateDiscountCategoryTargetDto) {
  
      const existing = await this.repo.findOne({
        where: {
          categoryId: dto.categoryId,
          isDeleted: false,
        },
      });
  
      if (existing) {
        throw new BadRequestException(
          'Category already has an active discount',
        );
      }
  
      const entity = this.repo.create(dto);
      return this.repo.save(entity);
    }
  
    async update(id: number, dto: UpdateDiscountCategoryTargetDto) {
  
      const entity = await this.repo.findOne({
        where: { id, isDeleted: false },
      });
  
      if (!entity) {
        throw new NotFoundException('Discount category target not found');
      }
  
      if (dto.categoryId && dto.categoryId !== entity.categoryId) {
        const existing = await this.repo.findOne({
          where: {
            categoryId: dto.categoryId,
            isDeleted: false,
          },
        });
  
        if (existing) {
          throw new BadRequestException(
            'Category already has an active discount',
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
        throw new NotFoundException('Discount category target not found');
      }
  
      return entity;
    }
  
    async findByCategory(categoryId: number) {
      return this.repo.findOne({
        where: {
          categoryId,
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