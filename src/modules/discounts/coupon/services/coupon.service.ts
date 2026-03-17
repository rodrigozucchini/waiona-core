import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { CouponEntity } from '../entities/coupon.entity';
  import { DiscountEntity } from '../../discount/entities/discounts.entity';
  
  import { CreateCouponDto } from '../dto/create-coupon.dto';
  import { UpdateCouponDto } from '../dto/update-coupon.dto';
  import { CouponResponseDto } from '../dto/coupon-response.dto';
  
  @Injectable()
  export class CouponService {
  
    constructor(
      @InjectRepository(CouponEntity)
      private couponRepository: Repository<CouponEntity>,
  
      @InjectRepository(DiscountEntity)
      private discountRepository: Repository<DiscountEntity>,
    ) {}
  
    async findAll(): Promise<CouponResponseDto[]> {
  
      const entities = await this.couponRepository.find({
        where: { isDeleted: false },
        relations: ['discount'],
        order: { createdAt: 'DESC' },
      });
  
      return entities.map(entity => new CouponResponseDto(entity));
    }
  
    async findById(id: number): Promise<CouponResponseDto> {
  
      const entity = await this.findOne(id);
  
      return new CouponResponseDto(entity);
    }
  
    async create(dto: CreateCouponDto): Promise<CouponResponseDto> {
  
      // 🔎 validar que el discount exista
      const discount = await this.discountRepository.findOne({
        where: { id: dto.discountId, isDeleted: false },
      });
  
      if (!discount) {
        throw new BadRequestException(
          `Discount with id ${dto.discountId} not found`,
        );
      }
  
      // 🔎 validar que el code no exista
      const existingCode = await this.couponRepository.findOne({
        where: { code: dto.code },
      });
  
      if (existingCode) {
        throw new BadRequestException(
          `Coupon code '${dto.code}' already exists`,
        );
      }
  
      const newEntity = this.couponRepository.create({
        ...dto,
        usageCount: 0, // siempre inicia en 0
      });
  
      const saved = await this.couponRepository.save(newEntity);
  
      const entityWithRelation = await this.findOne(saved.id);
  
      return new CouponResponseDto(entityWithRelation);
    }
  
    async update(
      id: number,
      changes: UpdateCouponDto,
    ): Promise<CouponResponseDto> {
  
      const entity = await this.findOne(id);
  
      // 🔎 si cambia discountId validar que exista
      if (changes.discountId) {
        const discount = await this.discountRepository.findOne({
          where: { id: changes.discountId, isDeleted: false },
        });
  
        if (!discount) {
          throw new BadRequestException(
            `Discount with id ${changes.discountId} not found`,
          );
        }
      }
  
      // 🔎 si cambia code validar que no esté duplicado
      if (changes.code && changes.code !== entity.code) {
        const existingCode = await this.couponRepository.findOne({
          where: { code: changes.code },
        });
  
        if (existingCode) {
          throw new BadRequestException(
            `Coupon code '${changes.code}' already exists`,
          );
        }
      }
  
      const merged = this.couponRepository.merge(entity, changes);
  
      const saved = await this.couponRepository.save(merged);
  
      const entityWithRelation = await this.findOne(saved.id);
  
      return new CouponResponseDto(entityWithRelation);
    }
  
    async delete(id: number): Promise<void> {
  
      const entity = await this.findOne(id);
  
      entity.isDeleted = true;
  
      await this.couponRepository.save(entity);
    }
  
    private async findOne(id: number): Promise<CouponEntity> {
  
      const entity = await this.couponRepository.findOne({
        where: {
          id,
          isDeleted: false,
        },
        relations: ['discount'],
      });
  
      if (!entity) {
        throw new NotFoundException(
          `Coupon with id ${id} not found`,
        );
      }
  
      return entity;
    }
  }