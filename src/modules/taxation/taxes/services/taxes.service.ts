import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { TaxEntity } from '../entities/tax.entity';
  import { TaxTypeEntity } from '../../tax-types/entities/tax-types.entity';
  
  import { CreateTaxDto } from '../dto/create-tax.dto';
  import { UpdateTaxDto } from '../dto/update-tax.dto';
  import { TaxResponseDto } from '../dto/tax-response.dto';
  
  @Injectable()
  export class TaxesService {
    constructor(
      @InjectRepository(TaxEntity)
      private taxRepository: Repository<TaxEntity>,
  
      @InjectRepository(TaxTypeEntity)
      private taxTypeRepository: Repository<TaxTypeEntity>,
    ) {}
  
    async findAll(): Promise<TaxResponseDto[]> {
  
      const entities = await this.taxRepository.find({
        where: { isDeleted: false },
        relations: ['taxType'], // necesario para el response dto
        order: { createdAt: 'DESC' },
      });
  
      return entities.map(entity => new TaxResponseDto(entity));
    }
  
    async findById(id: number): Promise<TaxResponseDto> {
  
      const entity = await this.findOne(id);
  
      return new TaxResponseDto(entity);
    }
  
    async create(dto: CreateTaxDto): Promise<TaxResponseDto> {
  
      const taxType = await this.taxTypeRepository.findOne({
        where: { id: dto.taxTypeId, isDeleted: false },
      });
  
      if (!taxType) {
        throw new BadRequestException(
          `TaxType with id ${dto.taxTypeId} not found`,
        );
      }
  
      const newEntity = this.taxRepository.create({
        taxTypeId: dto.taxTypeId,
        value: dto.value,
        isPercentage: dto.isPercentage,
      });
  
      const saved = await this.taxRepository.save(newEntity);
  
      const entityWithRelation = await this.findOne(saved.id);
  
      return new TaxResponseDto(entityWithRelation);
    }
  
    async update(
      id: number,
      changes: UpdateTaxDto,
    ): Promise<TaxResponseDto> {
  
      const entity = await this.findOne(id);
  
      const merged = this.taxRepository.merge(entity, changes);
  
      const saved = await this.taxRepository.save(merged);
  
      const entityWithRelation = await this.findOne(saved.id);
  
      return new TaxResponseDto(entityWithRelation);
    }
  
    async delete(id: number): Promise<void> {
  
      const entity = await this.findOne(id);
  
      entity.isDeleted = true;
  
      await this.taxRepository.save(entity);
    }
  
    private async findOne(id: number): Promise<TaxEntity> {
  
      const entity = await this.taxRepository.findOne({
        where: {
          id,
          isDeleted: false,
        },
        relations: ['taxType'],
      });
  
      if (!entity) {
        throw new NotFoundException(`Tax with id ${id} not found`);
      }
  
      return entity;
    }
  }