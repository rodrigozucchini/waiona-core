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
  
  import { DiscountProductTargetService } from '../services/discount-product-target.service';
  import { CreateDiscountProductTargetDto } from '../dto/create-discount-product-target.dto';
  import { UpdateDiscountProductTargetDto } from '../dto/update-discount-product-target.dto';
  import { DiscountProductTargetResponseDto } from '../dto/discount-target-response.dto';
  
  @Controller('discount-product-targets')
  export class DiscountProductTargetController {
  
    constructor(
      private readonly service: DiscountProductTargetService,
    ) {}
  
    // 🟢 CREATE
    @Post()
    async create(
      @Body() dto: CreateDiscountProductTargetDto,
    ): Promise<DiscountProductTargetResponseDto> {
  
      const entity = await this.service.create(dto);
      return new DiscountProductTargetResponseDto(entity);
    }
  
    // 🔵 GET ALL
    @Get()
    async findAll(): Promise<DiscountProductTargetResponseDto[]> {
  
      const entities = await this.service.findAll();
      return entities.map(
        (e) => new DiscountProductTargetResponseDto(e),
      );
    }
  
    // 🔵 GET ONE
    @Get(':id')
    async findOne(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<DiscountProductTargetResponseDto> {
  
      const entity = await this.service.findOne(id);
      return new DiscountProductTargetResponseDto(entity);
    }
  
    // 🔥 GET BY PRODUCT (clave para pricing)
    @Get('product/:productId')
    async findByProduct(
      @Param('productId', ParseIntPipe) productId: number,
    ): Promise<DiscountProductTargetResponseDto | null> {
  
      const entity = await this.service.findByProduct(productId);
      return entity
        ? new DiscountProductTargetResponseDto(entity)
        : null;
    }
  
    // 🟡 UPDATE
    @Patch(':id')
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateDiscountProductTargetDto,
    ): Promise<DiscountProductTargetResponseDto> {
  
      const entity = await this.service.update(id, dto);
      return new DiscountProductTargetResponseDto(entity);
    }
  
    // 🔴 DELETE (soft delete)
    @Delete(':id')
    async remove(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<DiscountProductTargetResponseDto> {
  
      const entity = await this.service.remove(id);
      return new DiscountProductTargetResponseDto(entity);
    }
  }