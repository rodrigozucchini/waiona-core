import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CategoryTaxEntity } from '../entities/category-taxes.entity';

import { CreateCategoryTaxDto } from '../dto/create-category-taxes.dto';
import { UpdateCategoryTaxDto } from '../dto/update-category-taxes.dto';
import { CategoryTaxResponseDto } from '../dto/category-taxes-response.dto';

@Injectable()
export class CategoryTaxesService {

  constructor(
    @InjectRepository(CategoryTaxEntity)
    private readonly categoryTaxRepository: Repository<CategoryTaxEntity>,
  ) {}

  // ==========================
  // CREATE
  // ==========================

  async create(dto: CreateCategoryTaxDto): Promise<CategoryTaxResponseDto> {

    const categoryTax = this.categoryTaxRepository.create(dto);

    const saved = await this.categoryTaxRepository.save(categoryTax);

    return new CategoryTaxResponseDto(saved);
  }

  // ==========================
  // GET ALL (no eliminados)
  // ==========================

  async findAll(): Promise<CategoryTaxResponseDto[]> {

    const categoryTaxes = await this.categoryTaxRepository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });

    return categoryTaxes.map(
      (categoryTax) => new CategoryTaxResponseDto(categoryTax),
    );
  }

  // ==========================
  // GET BY ID
  // ==========================

  async findOne(id: number): Promise<CategoryTaxResponseDto> {

    const categoryTax = await this.categoryTaxRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!categoryTax) {
      throw new NotFoundException(`CategoryTax with id ${id} not found`);
    }

    return new CategoryTaxResponseDto(categoryTax);
  }

  // ==========================
  // UPDATE
  // ==========================

  async update(
    id: number,
    dto: UpdateCategoryTaxDto,
  ): Promise<CategoryTaxResponseDto> {

    const categoryTax = await this.categoryTaxRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!categoryTax) {
      throw new NotFoundException(`CategoryTax with id ${id} not found`);
    }

    const merged = this.categoryTaxRepository.merge(categoryTax, dto);

    const updated = await this.categoryTaxRepository.save(merged);

    return new CategoryTaxResponseDto(updated);
  }

  // ==========================
  // SOFT DELETE
  // ==========================

  async remove(id: number): Promise<void> {

    const categoryTax = await this.categoryTaxRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!categoryTax) {
      throw new NotFoundException(`CategoryTax with id ${id} not found`);
    }

    categoryTax.isDeleted = true;

    await this.categoryTaxRepository.save(categoryTax);
  }

}