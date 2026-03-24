import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DiscountCategoryTargetEntity } from '../entities/discount-category-target.entity';
import { DiscountEntity } from '../../discount/entities/discounts.entity';
import { CreateDiscountCategoryTargetDto } from '../dto/create-discount-category-target.dto';
import { DiscountCategoryTargetResponseDto } from '../dto/discount-category-target.dto';

@Injectable()
export class DiscountCategoryTargetService {

  constructor(
    @InjectRepository(DiscountCategoryTargetEntity)
    private readonly repo: Repository<DiscountCategoryTargetEntity>,
    @InjectRepository(DiscountEntity)
    private readonly discountRepository: Repository<DiscountEntity>,
  ) {}

  // ==========================
  // CREATE
  // ==========================

  async create(
    discountId: number,
    dto: CreateDiscountCategoryTargetDto,
  ): Promise<DiscountCategoryTargetResponseDto> {
    await this.findDiscount(discountId);
    await this.validateUniqueTarget(discountId, dto.categoryId);

    // 🔥 la categoría no puede tener otro descuento activo (de cualquier descuento)
    await this.validateCategoryHasNoActiveDiscount(dto.categoryId);

    const entity = this.repo.create({
      discountId,
      categoryId: dto.categoryId,
    });

    const saved = await this.repo.save(entity);

    return new DiscountCategoryTargetResponseDto(saved);
  }

  // ==========================
  // GET ALL BY DISCOUNT
  // ==========================

  async findAll(discountId: number): Promise<DiscountCategoryTargetResponseDto[]> {
    await this.findDiscount(discountId);

    const targets = await this.repo.find({
      where: { discountId, isDeleted: false },
    });

    return targets.map((t) => new DiscountCategoryTargetResponseDto(t));
  }

  // ==========================
  // DELETE (soft)
  // ==========================

  async remove(discountId: number, categoryId: number): Promise<void> {
    await this.findDiscount(discountId);

    const entity = await this.repo.findOne({
      where: { discountId, categoryId, isDeleted: false },
    });

    if (!entity) {
      throw new NotFoundException(
        `Category target ${categoryId} not found for discount ${discountId}`,
      );
    }

    entity.isDeleted = true;
    await this.repo.save(entity);
  }

  // ==========================
  // PRIVATE HELPERS
  // ==========================

  private async findDiscount(discountId: number): Promise<DiscountEntity> {
    const discount = await this.discountRepository.findOne({
      where: { id: discountId, isDeleted: false },
    });

    if (!discount) {
      throw new NotFoundException(`Discount with id ${discountId} not found`);
    }

    return discount;
  }

  private async validateUniqueTarget(
    discountId: number,
    categoryId: number,
  ): Promise<void> {
    const existing = await this.repo.findOne({
      where: { discountId, categoryId, isDeleted: false },
    });

    if (existing) {
      throw new ConflictException(
        `Category ${categoryId} is already a target of discount ${discountId}`,
      );
    }
  }

  // 🔥 chequea que la categoría no esté asociada a NINGÚN descuento activo
  private async validateCategoryHasNoActiveDiscount(categoryId: number): Promise<void> {
    const existing = await this.repo.findOne({
      where: { categoryId, isDeleted: false },
    });

    if (existing) {
      throw new ConflictException(
        `Category ${categoryId} already has an active discount assigned`,
      );
    }
  }
}