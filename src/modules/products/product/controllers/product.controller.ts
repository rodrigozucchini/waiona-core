import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
  } from '@nestjs/common';
  
  import { ProductService } from '../services/product.service';
  
  import { CreateProductDto } from '../dto/create-product.dto';
  import { UpdateProductDto } from '../dto/update-product.dto';
  import { ProductResponseDto } from '../dto/product-response.dto';
  
  @Controller('products')
  export class ProductController {
  
    constructor(
      private readonly productService: ProductService,
    ) {}
  
    // ==========================
    // GET ALL
    // ==========================
  
    @Get()
    async findAll(): Promise<ProductResponseDto[]> {
      return this.productService.findAll();
    }
  
    // ==========================
    // GET BY ID
    // ==========================
  
    @Get(':id')
    async findById(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<ProductResponseDto> {
      return this.productService.findById(id);
    }
  
    // ==========================
    // CREATE
    // ==========================
  
    @Post()
    async create(
      @Body() body: CreateProductDto,
    ): Promise<ProductResponseDto> {
      return this.productService.create(body);
    }
  
    // ==========================
    // UPDATE
    // ==========================
  
    @Put(':id')
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() body: UpdateProductDto,
    ): Promise<ProductResponseDto> {
      return this.productService.update(id, body);
    }
  
    // ==========================
    // DELETE (soft)
    // ==========================
  
    @Delete(':id')
    async delete(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
      return this.productService.delete(id);
    }
  }