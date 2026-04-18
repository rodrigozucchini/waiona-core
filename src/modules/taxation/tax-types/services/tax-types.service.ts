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

    return entities.map(TaxTypeResponseDto.fromEntity);
  }

  async findById(id: number): Promise<TaxTypeResponseDto> {
    const entity = await this.findOne(id);
    return TaxTypeResponseDto.fromEntity(entity);
  }

  async create(dto: CreateTaxTypeDto): Promise<TaxTypeResponseDto> {
    await this.ensureCodeIsUnique(dto.code);

    const newEntity = this.taxTypeRepository.create(dto);
    const saved = await this.taxTypeRepository.save(newEntity);

    return TaxTypeResponseDto.fromEntity(saved);
  }

  async update(
    id: number,
    changes: UpdateTaxTypeDto,
  ): Promise<TaxTypeResponseDto> {
    const entity = await this.findOne(id);

    if (changes.code && changes.code !== entity.code) {
      await this.ensureCodeIsUnique(changes.code);
    }

    const merged = this.taxTypeRepository.merge(entity, changes);
    const saved = await this.taxTypeRepository.save(merged);

    return TaxTypeResponseDto.fromEntity(saved);
  }

  async delete(id: number): Promise<void> {
    const entity = await this.findOne(id);

    if (entity.isDeleted) return;

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

  private async ensureCodeIsUnique(code: string): Promise<void> {
    const existing = await this.taxTypeRepository.findOne({
      where: { code },
    });

    if (existing) {
      throw new BadRequestException(
        `Tax type with code "${code}" already exists`,
      );
    }
  }
}