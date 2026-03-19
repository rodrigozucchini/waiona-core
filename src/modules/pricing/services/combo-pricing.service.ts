import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { ComboPricingEntity } from '../entities/combo-pricing.entity';
  import { CreateComboPricingDto } from '../dto/create-combo-pricing.dto';
  import { UpdateComboPricingDto } from '../dto/update-combo-pricing.dto';
  import { ComboPricingResponseDto } from '../dto/combo-pricing-response.dto';
  
  @Injectable()
  export class ComboPricingService {
  
    constructor(
      @InjectRepository(ComboPricingEntity)
      private repo: Repository<ComboPricingEntity>,
    ) {}
  
    async create(dto: CreateComboPricingDto): Promise<ComboPricingResponseDto> {
  
      const existing = await this.repo.findOne({
        where: {
          comboId: dto.comboId,
          isDeleted: false,
        },
      });
  
      if (existing) {
        throw new BadRequestException(
          'Combo already has pricing',
        );
      }
  
      const entity = this.repo.create(dto);
      const saved = await this.repo.save(entity);
  
      return new ComboPricingResponseDto(saved);
    }
  
    async update(
      id: number,
      dto: UpdateComboPricingDto,
    ): Promise<ComboPricingResponseDto> {
  
      const entity = await this.repo.findOne({
        where: { id, isDeleted: false },
      });
  
      if (!entity) {
        throw new NotFoundException('Combo pricing not found');
      }
  
      if (dto.comboId && dto.comboId !== entity.comboId) {
        const existing = await this.repo.findOne({
          where: {
            comboId: dto.comboId,
            isDeleted: false,
          },
        });
  
        if (existing) {
          throw new BadRequestException(
            'Combo already has pricing',
          );
        }
      }
  
      Object.assign(entity, dto);
      const saved = await this.repo.save(entity);
  
      return new ComboPricingResponseDto(saved);
    }
  
    async findAll(): Promise<ComboPricingResponseDto[]> {
      const entities = await this.repo.find({
        where: { isDeleted: false },
      });
  
      return entities.map(
        (e) => new ComboPricingResponseDto(e),
      );
    }
  
    async findOne(id: number): Promise<ComboPricingResponseDto> {
      const entity = await this.repo.findOne({
        where: { id, isDeleted: false },
      });
  
      if (!entity) {
        throw new NotFoundException('Combo pricing not found');
      }
  
      return new ComboPricingResponseDto(entity);
    }
  
    async findByCombo(
      comboId: number,
    ): Promise<ComboPricingResponseDto> {
  
      const entity = await this.repo.findOne({
        where: {
          comboId,
          isDeleted: false,
        },
      });
  
      if (!entity) {
        throw new NotFoundException('Combo pricing not found');
      }
  
      return new ComboPricingResponseDto(entity);
    }
  
    async remove(id: number): Promise<void> {
      const entity = await this.repo.findOne({
        where: { id, isDeleted: false },
      });
  
      if (!entity) {
        throw new NotFoundException('Combo pricing not found');
      }
  
      entity.isDeleted = true;
      await this.repo.save(entity);
    }
  }