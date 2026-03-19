import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    ParseIntPipe,
    Patch,
    Delete,
  } from '@nestjs/common';
  
  import { CategoryTaxesService } from '../services/category-taxes.service';
  
  import { CreateCategoryTaxDto } from '../dto/create-category-taxes.dto';
  import { UpdateCategoryTaxDto } from '../dto/update-category-taxes.dto';
  import { CategoryTaxResponseDto } from '../dto/category-taxes-response.dto';
  
  @Controller('category-taxes')
  export class CategoryTaxesController {
  
    constructor(
      private readonly categoryTaxesService: CategoryTaxesService,
    ) {}
  
    // ==========================
    // GET ALL
    // ==========================
  
    @Get()
    async findAll(): Promise<CategoryTaxResponseDto[]> {
      return this.categoryTaxesService.findAll();
    }
  
    // ==========================
    // GET BY ID
    // ==========================
  
    @Get(':id')
    async findOne(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<CategoryTaxResponseDto> {
  
      return this.categoryTaxesService.findOne(id);
    }
  
    // ==========================
    // CREATE
    // ==========================
  
    @Post()
    async create(
      @Body() dto: CreateCategoryTaxDto,
    ): Promise<CategoryTaxResponseDto> {
  
      return this.categoryTaxesService.create(dto);
    }
  
    // ==========================
    // UPDATE
    // ==========================
  
    @Patch(':id')
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateCategoryTaxDto,
    ): Promise<CategoryTaxResponseDto> {
  
      return this.categoryTaxesService.update(id, dto);
    }
  
    // ==========================
    // SOFT DELETE
    // ==========================
  
    @Delete(':id')
    async remove(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
  
      return this.categoryTaxesService.remove(id);
    }
  
  }