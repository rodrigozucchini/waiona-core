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
      relations: ['taxType'],
      order: { createdAt: 'DESC' },
    });

    return entities.map(entity => new TaxResponseDto(entity));
  }

  async findById(id: number): Promise<TaxResponseDto> {
    const entity = await this.findOne(id);
    return new TaxResponseDto(entity);
  }

  async create(dto: CreateTaxDto): Promise<TaxResponseDto> {

    // 🔎 validar taxType
    const taxType = await this.taxTypeRepository.findOne({
      where: { id: dto.taxTypeId, isDeleted: false },
    });

    if (!taxType) {
      throw new BadRequestException(
        `TaxType with id ${dto.taxTypeId} not found`,
      );
    }

    // 🔥 VALIDACIÓN CLAVE
    if (!dto.isPercentage && !dto.currency) {
      throw new BadRequestException(
        'Currency is required for fixed taxes',
      );
    }

    if (dto.isPercentage && dto.currency) {
      throw new BadRequestException(
        'Percentage taxes should not have currency',
      );
    }

    const newEntity = this.taxRepository.create({
      taxTypeId: dto.taxTypeId,
      value: dto.value,
      isPercentage: dto.isPercentage,
      currency: dto.currency,
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

    // 🔎 validar taxType si viene
    if (changes.taxTypeId) {
      const taxType = await this.taxTypeRepository.findOne({
        where: { id: changes.taxTypeId, isDeleted: false },
      });

      if (!taxType) {
        throw new BadRequestException(
          `TaxType with id ${changes.taxTypeId} not found`,
        );
      }
    }

    // 🔥 VALIDACIÓN INTELIGENTE (merge previo)
    const isPercentage =
      changes.isPercentage ?? entity.isPercentage;

    const currency =
      changes.currency !== undefined
        ? changes.currency
        : entity.currency;

    if (!isPercentage && !currency) {
      throw new BadRequestException(
        'Currency is required for fixed taxes',
      );
    }

    if (isPercentage && currency) {
      throw new BadRequestException(
        'Percentage taxes should not have currency',
      );
    }

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