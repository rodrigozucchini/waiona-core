import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, IsNull } from 'typeorm';
  
  import { CategoryEntity } from '../entities/category.entity';
  import { CreateCategoryDto } from '../dto/create-category.dto';
  import { UpdateCategoryDto } from '../dto/update-category.dto';
  import { CategoryResponseDto } from '../dto/category-response.dto';
  import { CategoryTreeResponseDto } from '../dto/category-tree-response.dto';
  
  @Injectable()
  export class CategoryService {
  
    constructor(
      @InjectRepository(CategoryEntity)
      private readonly categoryRepository: Repository<CategoryEntity>,
    ) {}
  
    // ==========================
    // GET ALL (plano)
    // ==========================
  
    async findAll(): Promise<CategoryResponseDto[]> {
  
      const entities = await this.categoryRepository.find({
        where: {
          isDeleted: false,
        },
        order: {
          name: 'ASC',
        },
      });
  
      return entities.map(
        entity => new CategoryResponseDto(entity),
      );
    }
  
    // ==========================
    // GET BY ID
    // ==========================
  
    async findById(id: number): Promise<CategoryResponseDto> {
  
      const entity = await this.findOne(id);
  
      return new CategoryResponseDto(entity);
    }
  
    // ==========================
    // CREATE
    // ==========================
  
    async create(
      dto: CreateCategoryDto,
    ): Promise<CategoryResponseDto> {
  
      let parent: CategoryEntity | null = null;
  
      if (dto.parentId) {
        parent = await this.categoryRepository.findOne({
          where: {
            id: dto.parentId,
            isDeleted: false,
          },
        });
  
        if (!parent) {
          throw new BadRequestException(
            `Parent category with id ${dto.parentId} not found`,
          );
        }
      }
  
      const entity = this.categoryRepository.create({
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
        parentId: parent ? parent.id : null,
      });
  
      const saved = await this.categoryRepository.save(entity);
  
      return new CategoryResponseDto(saved);
    }
  
    // ==========================
    // UPDATE
    // ==========================
  
    async update(
      id: number,
      changes: UpdateCategoryDto,
    ): Promise<CategoryResponseDto> {
  
      const entity = await this.findOne(id);
  
      // 🚨 evitar que sea su propio padre
      if (changes.parentId && changes.parentId === id) {
        throw new BadRequestException(
          'Category cannot be its own parent',
        );
      }
  
      if (changes.parentId) {
        const parent = await this.categoryRepository.findOne({
          where: {
            id: changes.parentId,
            isDeleted: false,
          },
        });
  
        if (!parent) {
          throw new BadRequestException(
            `Parent category with id ${changes.parentId} not found`,
          );
        }
      }
  
      const merged = this.categoryRepository.merge(entity, changes);
  
      const saved = await this.categoryRepository.save(merged);
  
      return new CategoryResponseDto(saved);
    }
  
    // ==========================
    // SOFT DELETE
    // ==========================
  
    async delete(id: number): Promise<void> {
  
      const entity = await this.findOne(id);
  
      entity.isDeleted = true;
  
      await this.categoryRepository.save(entity);
    }
  
    // ==========================
    // TREE (solo raíces)
    // ==========================
  
    async getTree(): Promise<CategoryTreeResponseDto[]> {
  
      const roots = await this.categoryRepository.find({
        where: {
          parentId: IsNull(),
          isDeleted: false,
        },
        relations: ['children'],
        order: {
          name: 'ASC',
        },
      });
  
      return roots.map(
        root => new CategoryTreeResponseDto(root),
      );
    }
  
    // ==========================
    // PRIVATE FIND ONE
    // ==========================
  
    private async findOne(id: number): Promise<CategoryEntity> {
  
      const entity = await this.categoryRepository.findOne({
        where: {
          id,
          isDeleted: false,
        },
      });
  
      if (!entity) {
        throw new NotFoundException(
          `Category with id ${id} not found`,
        );
      }
  
      return entity;
    }
  }