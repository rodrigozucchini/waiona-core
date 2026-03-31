import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ComboTaxEntity } from '../entities/combo.-taxes.entity';
import { TaxEntity } from 'src/modules/taxation/taxes/entities/tax.entity';

import { CreateComboTaxDto } from '../dto/create-combo-taxes.dto';
import { UpdateComboTaxDto } from '../dto/update-combo-taxes.dto';
import { ComboTaxResponseDto } from '../dto/combo-taxes-response.dto';

@Injectable()
export class ComboTaxesService {

  constructor(
    @InjectRepository(ComboTaxEntity)
    private readonly comboTaxRepository: Repository<ComboTaxEntity>,

    @InjectRepository(TaxEntity)
    private readonly taxRepository: Repository<TaxEntity>,
  ) {}

  // ==========================
  // CREATE
  // ==========================

  async create(dto: CreateComboTaxDto): Promise<ComboTaxResponseDto> {

    const tax = await this.taxRepository.findOne({
      where: { id: dto.taxId, isDeleted: false },
    });

    if (!tax) {
      throw new NotFoundException(`Tax with id ${dto.taxId} not found`);
    }

    if (tax.isGlobal) {
      throw new BadRequestException('A global tax cannot be assigned to a specific combo');
    }

    const comboTax = this.comboTaxRepository.create(dto);
    const saved = await this.comboTaxRepository.save(comboTax);
    return new ComboTaxResponseDto(saved);
  }

  // ==========================
  // GET ALL
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

  async update(id: number, dto: UpdateComboTaxDto): Promise<ComboTaxResponseDto> {

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