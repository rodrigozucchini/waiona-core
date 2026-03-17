import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { DiscountProductTargetEntity } from '../entities/discount-product-target.entity';
  import { CreateDiscountProductTargetDto } from '../dto/create-discount-product-target.dto';
  import { UpdateDiscountProductTargetDto } from '../dto/update-discount-product-target.dto';
  
  @Injectable()
  export class DiscountProductTargetService {
  
    constructor(
      @InjectRepository(DiscountProductTargetEntity)
      private readonly repo: Repository<DiscountProductTargetEntity>,
    ) {}
  
    // 🟢 CREATE
    async create(dto: CreateDiscountProductTargetDto) {
  
      const existing = await this.repo.findOne({
        where: {
          productId: dto.productId,
          isDeleted: false,
        },
      });
  
      if (existing) {
        throw new BadRequestException(
          'Product already has an active discount',
        );
      }
  
      const entity = this.repo.create(dto);
      return this.repo.save(entity);
    }
  
    // 🟡 UPDATE
    async update(id: number, dto: UpdateDiscountProductTargetDto) {
  
      const entity = await this.repo.findOne({
        where: { id, isDeleted: false },
      });
  
      if (!entity) {
        throw new NotFoundException('Discount product target not found');
      }
  
      // si cambia el productId, validar regla
      if (dto.productId && dto.productId !== entity.productId) {
        const existing = await this.repo.findOne({
          where: {
            productId: dto.productId,
            isDeleted: false,
          },
        });
  
        if (existing) {
          throw new BadRequestException(
            'Product already has an active discount',
          );
        }
      }
  
      Object.assign(entity, dto);
      return this.repo.save(entity);
    }
  
    // 🔵 GET ALL
    async findAll() {
      return this.repo.find({
        where: { isDeleted: false },
      });
    }
  
    // 🔵 GET ONE
    async findOne(id: number) {
      const entity = await this.repo.findOne({
        where: { id, isDeleted: false },
      });
  
      if (!entity) {
        throw new NotFoundException('Discount product target not found');
      }
  
      return entity;
    }
  
    // 🔥 GET BY PRODUCT (clave para pricing)
    async findByProduct(productId: number) {
      return this.repo.findOne({
        where: {
          productId,
          isDeleted: false,
        },
      });
    }
  
    // 🔴 SOFT DELETE
    async remove(id: number) {
      const entity = await this.findOne(id);
  
      entity.isDeleted = true;
      return this.repo.save(entity);
    }
  }