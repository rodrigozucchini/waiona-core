import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MarginEntity } from '../entities/margin.entity';
import { CreateMarginDto } from '../dto/create-margin.dto';
import { UpdateMarginDto } from '../dto/update-margin.dto';
import { MarginResponseDto } from '../dto/response-margin.dto';

@Injectable()
export class MarginsService {
  constructor(
    @InjectRepository(MarginEntity)
    private readonly marginRepository: Repository<MarginEntity>,
  ) {}

  // CREATE
  async create(dto: CreateMarginDto): Promise<MarginResponseDto> {
    const margin = this.marginRepository.create(dto);

    const saved = await this.marginRepository.save(margin);

    return new MarginResponseDto(saved);
  }

  // GET ALL (no eliminados)
  async findAll(): Promise<MarginResponseDto[]> {
    const margins = await this.marginRepository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });

    return margins.map((margin) => new MarginResponseDto(margin));
  }

  // GET BY ID
  async findOne(id: number): Promise<MarginResponseDto> {
    const margin = await this.marginRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!margin) {
      throw new NotFoundException(`Margin with id ${id} not found`);
    }

    return new MarginResponseDto(margin);
  }

  // UPDATE (parcial, sin romper tipos)
  async update(
    id: number,
    dto: UpdateMarginDto,
  ): Promise<MarginResponseDto> {
    const margin = await this.marginRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!margin) {
      throw new NotFoundException(`Margin with id ${id} not found`);
    }

    const merged = this.marginRepository.merge(margin, dto);

    const updated = await this.marginRepository.save(merged);

    return new MarginResponseDto(updated);
  }

  // SOFT DELETE
  async remove(id: number): Promise<void> {
    const margin = await this.marginRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!margin) {
      throw new NotFoundException(`Margin with id ${id} not found`);
    }

    margin.isDeleted = true;

    await this.marginRepository.save(margin);
  }
}