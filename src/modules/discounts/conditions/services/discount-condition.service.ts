import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { DiscountConditionEntity } from '../entities/discount-condition.entity';
  import { DiscountEntity } from '../../discount/entities/discounts.entity';
  
  import { CreateDiscountConditionDto } from '../dto/create-discount-condition.dto';
  import { UpdateDiscountConditionDto } from '../dto/update-discount-condition.dto';
  import { DiscountConditionResponseDto } from '../dto/discount-condition-response.dto';
  
  @Injectable()
  export class DiscountConditionService {
  
    constructor(
      @InjectRepository(DiscountConditionEntity)
      private discountConditionRepository: Repository<DiscountConditionEntity>,
  
      @InjectRepository(DiscountEntity)
      private discountRepository: Repository<DiscountEntity>,
    ) {}
  
    async findAll(): Promise<DiscountConditionResponseDto[]> {
  
      const entities = await this.discountConditionRepository.find({
        where: { isDeleted: false },
        relations: ['discount'],
        order: { createdAt: 'DESC' },
      });
  
      return entities.map(
        entity => new DiscountConditionResponseDto(entity),
      );
    }
  
    async findById(id: number): Promise<DiscountConditionResponseDto> {
  
      const entity = await this.findOne(id);
  
      return new DiscountConditionResponseDto(entity);
    }
  
    async create(
      dto: CreateDiscountConditionDto,
    ): Promise<DiscountConditionResponseDto> {
  
      // 🔎 Validar que el discount exista
      const discount = await this.discountRepository.findOne({
        where: { id: dto.discountId, isDeleted: false },
      });
  
      if (!discount) {
        throw new BadRequestException(
          `Discount with id ${dto.discountId} not found`,
        );
      }
  
      const newEntity = this.discountConditionRepository.create({
        ...dto,
      });
  
      const saved = await this.discountConditionRepository.save(newEntity);
  
      const entityWithRelation = await this.findOne(saved.id);
  
      return new DiscountConditionResponseDto(entityWithRelation);
    }
  
    async update(
      id: number,
      changes: UpdateDiscountConditionDto,
    ): Promise<DiscountConditionResponseDto> {
  
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
  
      const merged = this.discountConditionRepository.merge(entity, changes);
  
      const saved = await this.discountConditionRepository.save(merged);
  
      const entityWithRelation = await this.findOne(saved.id);
  
      return new DiscountConditionResponseDto(entityWithRelation);
    }
  
    async delete(id: number): Promise<void> {
  
      const entity = await this.findOne(id);
  
      entity.isDeleted = true;
  
      await this.discountConditionRepository.save(entity);
    }
  
    private async findOne(id: number): Promise<DiscountConditionEntity> {
  
      const entity = await this.discountConditionRepository.findOne({
        where: {
          id,
          isDeleted: false,
        },
        relations: ['discount'],
      });
  
      if (!entity) {
        throw new NotFoundException(
          `DiscountCondition with id ${id} not found`,
        );
      }
  
      return entity;
    }
  }