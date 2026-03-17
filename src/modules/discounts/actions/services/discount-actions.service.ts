import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { DiscountActionEntity } from '../entities/discount-action.entity';
  import { DiscountEntity } from '../../discount/entities/discounts.entity';
  
  import { CreateDiscountActionDto } from '../dto/create-discount-action.dto';
  import { UpdateDiscountActionDto } from '../dto/update-discount-action.dto';
  import { DiscountActionResponseDto } from '../dto/discount-action-response.dto';
  
  @Injectable()
  export class DiscountActionsService {
  
    constructor(
      @InjectRepository(DiscountActionEntity)
      private discountActionRepository: Repository<DiscountActionEntity>,
  
      @InjectRepository(DiscountEntity)
      private discountRepository: Repository<DiscountEntity>,
    ) {}
  
    async findAll(): Promise<DiscountActionResponseDto[]> {
  
      const entities = await this.discountActionRepository.find({
        where: { isDeleted: false },
        relations: ['discount'],
        order: { createdAt: 'DESC' },
      });
  
      return entities.map(
        entity => new DiscountActionResponseDto(entity),
      );
    }
  
    async findById(id: number): Promise<DiscountActionResponseDto> {
  
      const entity = await this.findOne(id);
  
      return new DiscountActionResponseDto(entity);
    }
  
    async create(
      dto: CreateDiscountActionDto,
    ): Promise<DiscountActionResponseDto> {
  
      // 🔎 Validar que el discount exista
      const discount = await this.discountRepository.findOne({
        where: { id: dto.discountId, isDeleted: false },
      });
  
      if (!discount) {
        throw new BadRequestException(
          `Discount with id ${dto.discountId} not found`,
        );
      }
  
      const newEntity = this.discountActionRepository.create({
        ...dto,
      });
  
      const saved = await this.discountActionRepository.save(newEntity);
  
      const entityWithRelation = await this.findOne(saved.id);
  
      return new DiscountActionResponseDto(entityWithRelation);
    }
  
    async update(
      id: number,
      changes: UpdateDiscountActionDto,
    ): Promise<DiscountActionResponseDto> {
  
      const entity = await this.findOne(id);
  
      // 🔎 Si cambia discountId validar que exista
      if (changes.discountId) {
        const discount = await this.discountRepository.findOne({
          where: { id: changes.discountId, isDeleted: false },
        });
  
        if (!discount) {
          throw new BadRequestException(
            `Discount with id ${changes.discountId} not found`,
          );
        }
      }
  
      const merged = this.discountActionRepository.merge(entity, changes);
  
      const saved = await this.discountActionRepository.save(merged);
  
      const entityWithRelation = await this.findOne(saved.id);
  
      return new DiscountActionResponseDto(entityWithRelation);
    }
  
    async delete(id: number): Promise<void> {
  
      const entity = await this.findOne(id);
  
      entity.isDeleted = true;
  
      await this.discountActionRepository.save(entity);
    }
  
    private async findOne(id: number): Promise<DiscountActionEntity> {
  
      const entity = await this.discountActionRepository.findOne({
        where: {
          id,
          isDeleted: false,
        },
        relations: ['discount'],
      });
  
      if (!entity) {
        throw new NotFoundException(
          `DiscountAction with id ${id} not found`,
        );
      }
  
      return entity;
    }
  }