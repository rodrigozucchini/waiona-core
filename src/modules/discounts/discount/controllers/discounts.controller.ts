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
  
  import { DiscountsService } from '../services/discounts.service';
  import { CreateDiscountDto } from '../dto/create-discount.dto';
  import { UpdateDiscountDto } from '../dto/update-discount.dto';
  import { DiscountResponseDto } from '../dto/response-discount.dto';
  
  @Controller('discounts')
  export class DiscountsController {
    constructor(
      private readonly discountsService: DiscountsService,
    ) {}
  
    // CREATE
    @Post()
    create(
      @Body() dto: CreateDiscountDto,
    ): Promise<DiscountResponseDto> {
      return this.discountsService.create(dto);
    }
  
    // GET ALL
    @Get()
    findAll(): Promise<DiscountResponseDto[]> {
      return this.discountsService.findAll();
    }
  
    // GET BY ID
    @Get(':id')
    findOne(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<DiscountResponseDto> {
      return this.discountsService.findOne(id);
    }
  
    // UPDATE
    @Put(':id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateDiscountDto,
    ): Promise<DiscountResponseDto> {
      return this.discountsService.update(id, dto);
    }
  
    // SOFT DELETE
    @Delete(':id')
    remove(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
      return this.discountsService.remove(id);
    }
  }