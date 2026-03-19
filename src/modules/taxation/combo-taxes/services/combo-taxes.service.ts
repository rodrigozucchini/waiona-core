import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ComboTaxEntity } from '../entities/combo.-taxes.entity';

import { CreateComboTaxDto } from '../dto/create-combo-taxes.dto';
import { UpdateComboTaxDto } from '../dto/update-combo-taxes.dto';
import { ComboTaxResponseDto } from '../dto/combo-taxes-response.dto';

@Injectable()
export class ComboTaxesService {

  constructor(
    @InjectRepository(ComboTaxEntity)
    private readonly comboTaxRepository: Repository<ComboTaxEntity>,
  ) {}

  // ==========================
  // CREATE
  // ==========================

  async create(dto: CreateComboTaxDto): Promise<ComboTaxResponseDto> {

    const comboTax = this.comboTaxRepository.create(dto);

    const saved = await this.comboTaxRepository.save(comboTax);

    return new ComboTaxResponseDto(saved);
  }

  // ==========================
  // GET ALL (no eliminados)
  // ==========================

  async findAll(): Promise<ComboTaxResponseDto[]> {

    const comboTaxes = await this.comboTaxRepository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });

    return comboTaxes.map(
      (comboTax) => new ComboTaxResponseDto(comboTax),
    );
  }

  // ==========================
  // GET BY ID
  // ==========================

  async findOne(id: number): Promise<ComboTaxResponseDto> {

    const comboTax = await this.comboTaxRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!comboTax) {
      throw new NotFoundException(`ComboTax with id ${id} not found`);
    }

    return new ComboTaxResponseDto(comboTax);
  }

  // ==========================
  // UPDATE
  // ==========================

  async update(
    id: number,
    dto: UpdateComboTaxDto,
  ): Promise<ComboTaxResponseDto> {

    const comboTax = await this.comboTaxRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!comboTax) {
      throw new NotFoundException(`ComboTax with id ${id} not found`);
    }

    const merged = this.comboTaxRepository.merge(comboTax, dto);

    const updated = await this.comboTaxRepository.save(merged);

    return new ComboTaxResponseDto(updated);
  }

  // ==========================
  // SOFT DELETE
  // ==========================

  async remove(id: number): Promise<void> {

    const comboTax = await this.comboTaxRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!comboTax) {
      throw new NotFoundException(`ComboTax with id ${id} not found`);
    }

    comboTax.isDeleted = true;

    await this.comboTaxRepository.save(comboTax);
  }

}