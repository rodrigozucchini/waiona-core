import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
  } from '@nestjs/common';
  
  import { DiscountCategoryTargetService } from '../services/discount-category-target.service';
  import { CreateDiscountCategoryTargetDto } from '../dto/create-discount-category-target.dto';
  import { UpdateDiscountCategoryTargetDto } from '../dto/update-discount-category-target.dto';
  import { DiscountCategoryTargetResponseDto } from '../dto/discount-category-target.dto';
  
  @Controller('discount-category-targets')
  export class DiscountCategoryTargetController {
  
    constructor(
      private readonly service: DiscountCategoryTargetService,
    ) {}
  
    @Post()
    async create(@Body() dto: CreateDiscountCategoryTargetDto) {
      const entity = await this.service.create(dto);
      return new DiscountCategoryTargetResponseDto(entity);
    }
  
    @Get()
    async findAll() {
      const entities = await this.service.findAll();
      return entities.map(e => new DiscountCategoryTargetResponseDto(e));
    }
  
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
      const entity = await this.service.findOne(id);
      return new DiscountCategoryTargetResponseDto(entity);
    }
  
    @Get('category/:categoryId')
    async findByCategory(
      @Param('categoryId', ParseIntPipe) categoryId: number,
    ) {
      const entity = await this.service.findByCategory(categoryId);
      return entity
        ? new DiscountCategoryTargetResponseDto(entity)
        : null;
    }
  
    @Patch(':id')
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateDiscountCategoryTargetDto,
    ) {
      const entity = await this.service.update(id, dto);
      return new DiscountCategoryTargetResponseDto(entity);
    }
  
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
      const entity = await this.service.remove(id);
      return new DiscountCategoryTargetResponseDto(entity);
    }
  }