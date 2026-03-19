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
  
  import { ProductPricingService } from '../services/product-pricing.service';
  import { CreateProductPricingDto } from '../dto/create-product-pricing.dto';
  import { UpdateProductPricingDto } from '../dto/update-product-pricing-dto';
  import { ProductPricingResponseDto } from '../dto/product-pricing-response.dto';
  
  @Controller('product-pricing')
  export class ProductPricingController {
  
    constructor(
      private readonly service: ProductPricingService,
    ) {}
  
    // CREATE
    @Post()
    async create(
      @Body() dto: CreateProductPricingDto,
    ): Promise<ProductPricingResponseDto> {
      return this.service.create(dto);
    }
  
    // GET ALL
    @Get()
    async findAll(): Promise<ProductPricingResponseDto[]> {
      return this.service.findAll();
    }
  
    // GET ONE
    @Get(':id')
    async findOne(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<ProductPricingResponseDto> {
      return this.service.findOne(id);
    }
  
    // 🔥 GET BY PRODUCT
    @Get('product/:productId')
    async findByProduct(
      @Param('productId', ParseIntPipe) productId: number,
    ): Promise<ProductPricingResponseDto> {
      return this.service.findByProduct(productId);
    }
  
    // UPDATE
    @Patch(':id')
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateProductPricingDto,
    ): Promise<ProductPricingResponseDto> {
      return this.service.update(id, dto);
    }
  
    // DELETE
    @Delete(':id')
    async remove(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
      return this.service.remove(id);
    }
  }