import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { TaxTypeEntity } from '../entities/tax-types.entity';
  import { CreateTaxTypeDto } from '../dto/create-tax-type.dto';
  import { UpdateTaxTypeDto } from '../dto/update-tax-type.dto';
  import { TaxTypeResponseDto } from '../dto/tax-type-response.dto';
  
  @Injectable()
  export class TaxTypesService {
    constructor(
      @InjectRepository(TaxTypeEntity)
      private taxTypeRepository: Repository<TaxTypeEntity>,
    ) {}
  
    async findAll(): Promise<TaxTypeResponseDto[]> {
  
      const entities = await this.taxTypeRepository.find({
        where: { isDeleted: false },
        order: { createdAt: 'DESC' },
      });
  
      return entities.map(entity => new TaxTypeResponseDto(entity));
    }
  
    async findById(id: number): Promise<TaxTypeResponseDto> {
  
      const entity = await this.findOne(id);
  
      return new TaxTypeResponseDto(entity);
    }
  
    async create(dto: CreateTaxTypeDto): Promise<TaxTypeResponseDto> {
  
      const newEntity = this.taxTypeRepository.create(dto);
  
      const saved = await this.taxTypeRepository.save(newEntity);
  
      return new TaxTypeResponseDto(saved);
    }
  
    async update(
      id: number,
      changes: UpdateTaxTypeDto,
    ): Promise<TaxTypeResponseDto> {
  
      const entity = await this.findOne(id);
  
      const merged = this.taxTypeRepository.merge(entity, changes);
  
      const saved = await this.taxTypeRepository.save(merged);
  
      return new TaxTypeResponseDto(saved);
    }
  
    async delete(id: number): Promise<void> {
  
      const entity = await this.findOne(id);
  
      entity.isDeleted = true;
  
      await this.taxTypeRepository.save(entity);
    }
  
    private async findOne(id: number): Promise<TaxTypeEntity> {
  
      const entity = await this.taxTypeRepository.findOne({
        where: { id, isDeleted: false },
      });
  
      if (!entity) {
        throw new NotFoundException(`Tax type with id ${id} not found`);
      }
  
      return entity;
    }
  }