import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    ParseIntPipe,
  } from '@nestjs/common';
  
  import { DiscountUsageService } from '../services/discount-usage.service';
  
  import { CreateDiscountUsageDto } from '../dto/create-discount-usage.dto';
  import { UpdateDiscountUsageDto } from '../dto/update-discount-usage.dto';
  import { DiscountUsageResponseDto } from '../dto/discount-usage-response.dto';
  
  @Controller('discount-usage')
  export class DiscountUsageController {
  
    constructor(
      private discountUsageService: DiscountUsageService,
    ) {}
  
    @Get()
    getDiscountUsage(): Promise<DiscountUsageResponseDto[]> {
      return this.discountUsageService.findAll();
    }
  
    @Get(':id')
    findDiscountUsage(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<DiscountUsageResponseDto> {
      return this.discountUsageService.findById(id);
    }
  
    @Post()
    createDiscountUsage(
      @Body() body: CreateDiscountUsageDto,
    ): Promise<DiscountUsageResponseDto> {
      return this.discountUsageService.create(body);
    }
  
    @Put(':id')
    updateDiscountUsage(
      @Param('id', ParseIntPipe) id: number,
      @Body() changes: UpdateDiscountUsageDto,
    ): Promise<DiscountUsageResponseDto> {
      return this.discountUsageService.update(id, changes);
    }
  
    @Delete(':id')
    deleteDiscountUsage(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
      return this.discountUsageService.delete(id);
    }
  }