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
  
  import { ProductTaxesService } from '../services/product-taxes.service';
  
  import { CreateProductTaxDto } from '../dto/create-product-tax.dto';
  import { UpdateProductTaxDto } from '../dto/update-product-tax.dto';
  import { ProductTaxResponseDto } from '../dto/product-tax-response.dto';
  
  @Controller('product-taxes')
  export class ProductTaxesController {
  
    constructor(
      private readonly productTaxesService: ProductTaxesService,
    ) {}
  
    // ==========================
    // GET ALL
    // ==========================
  
    @Get()
    async findAll(): Promise<ProductTaxResponseDto[]> {
      return this.productTaxesService.findAll();
    }
  
    // ==========================
    // GET BY ID
    // ==========================
  
    @Get(':id')
    async findOne(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<ProductTaxResponseDto> {
  
      return this.productTaxesService.findOne(id);
    }
  
    // ==========================
    // CREATE
    // ==========================
  
    @Post()
    async create(
      @Body() dto: CreateProductTaxDto,
    ): Promise<ProductTaxResponseDto> {
  
      return this.productTaxesService.create(dto);
    }
  
    // ==========================
    // UPDATE
    // ==========================
  
    @Patch(':id')
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateProductTaxDto,
    ): Promise<ProductTaxResponseDto> {
  
      return this.productTaxesService.update(id, dto);
    }
  
    // ==========================
    // SOFT DELETE
    // ==========================
  
    @Delete(':id')
    async remove(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
  
      return this.productTaxesService.remove(id);
    }
  
  }