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
  
  import { ProductImageService } from '../services/product-image.service';
  import { CreateProductImageDto } from '../dto/create-product-image.dto';
  import { UpdateProductImageDto } from '../dto/update-product-image.dto';
  import { ProductImageResponseDto } from '../dto/product-image-response.dto';
  
  @Controller('product-images')
  export class ProductImageController {
    constructor(
      private readonly productImageService: ProductImageService,
    ) {}
  
    // CREATE
    @Post()
    create(
      @Body() dto: CreateProductImageDto,
    ): Promise<ProductImageResponseDto> {
      return this.productImageService.create(dto);
    }
  
    // GET ALL BY PRODUCT
    @Get('product/:productId')
    findByProduct(
      @Param('productId', ParseIntPipe) productId: number,
    ): Promise<ProductImageResponseDto[]> {
      return this.productImageService.findByProduct(productId);
    }
  
    // GET BY ID
    @Get(':id')
    findOne(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<ProductImageResponseDto> {
      return this.productImageService.findOne(id);
    }
  
    // UPDATE
    @Patch(':id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateProductImageDto,
    ): Promise<ProductImageResponseDto> {
      return this.productImageService.update(id, dto);
    }
  
    // SOFT DELETE
    @Delete(':id')
    remove(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
      return this.productImageService.remove(id);
    }
  }