import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { DiscountEntity } from '../entities/discounts.entity';
  import { CreateDiscountDto } from '../dto/create-discount.dto';
  import { UpdateDiscountDto } from '../dto/update-discount.dto';
  import { DiscountResponseDto } from '../dto/response-discount.dto';
  
  @Injectable()
  export class DiscountsService {
    constructor(
      @InjectRepository(DiscountEntity)
      private readonly discountRepository: Repository<DiscountEntity>,
    ) {}
  
    // CREATE
    async create(dto: CreateDiscountDto): Promise<DiscountResponseDto> {
      if (dto.startsAt && dto.endAt) {
        if (new Date(dto.startsAt) > new Date(dto.endAt)) {
          throw new BadRequestException(
            'startsAt cannot be greater than endAt',
          );
        }
      }
  
      const discount = this.discountRepository.create({
        ...dto,
        usageCount: 0, // siempre inicia en 0
      });
  
      const saved = await this.discountRepository.save(discount);
  
      return new DiscountResponseDto(saved);
    }
  
    // GET ALL (no eliminados)
    async findAll(): Promise<DiscountResponseDto[]> {
      const discounts = await this.discountRepository.find({
        where: { isDeleted: false },
        order: { createdAt: 'DESC' },
      });
  
      return discounts.map(
        (discount) => new DiscountResponseDto(discount),
      );
    }
  
    // GET BY ID
    async findOne(id: number): Promise<DiscountResponseDto> {
      const discount = await this.discountRepository.findOne({
        where: { id, isDeleted: false },
      });
  
      if (!discount) {
        throw new NotFoundException(
          `Discount with id ${id} not found`,
        );
      }
  
      return new DiscountResponseDto(discount);
    }
  
    // UPDATE (parcial, mismo patrón que margins)
    async update(
      id: number,
      dto: UpdateDiscountDto,
    ): Promise<DiscountResponseDto> {
      const discount = await this.discountRepository.findOne({
        where: { id, isDeleted: false },
      });
  
      if (!discount) {
        throw new NotFoundException(
          `Discount with id ${id} not found`,
        );
      }
  
      if (dto.startsAt && dto.endAt) {
        if (new Date(dto.startsAt) > new Date(dto.endAt)) {
          throw new BadRequestException(
            'startsAt cannot be greater than endAt',
          );
        }
      }
  
      const merged = this.discountRepository.merge(discount, dto);
  
      const updated = await this.discountRepository.save(merged);
  
      return new DiscountResponseDto(updated);
    }
  
    // SOFT DELETE
    async remove(id: number): Promise<void> {
      const discount = await this.discountRepository.findOne({
        where: { id, isDeleted: false },
      });
  
      if (!discount) {
        throw new NotFoundException(
          `Discount with id ${id} not found`,
        );
      }
  
      discount.isDeleted = true;
  
      await this.discountRepository.save(discount);
    }
  }