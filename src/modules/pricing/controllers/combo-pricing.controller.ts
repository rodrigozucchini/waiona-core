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
  
  import { ComboPricingService } from '../services/combo-pricing.service';
  import { CreateComboPricingDto } from '../dto/create-combo-pricing.dto';
  import { UpdateComboPricingDto } from '../dto/update-combo-pricing.dto';
  import { ComboPricingResponseDto } from '../dto/combo-pricing-response.dto';
  
  @Controller('combo-pricing')
  export class ComboPricingController {
  
    constructor(
      private readonly service: ComboPricingService,
    ) {}
  
    // CREATE
    @Post()
    async create(
      @Body() dto: CreateComboPricingDto,
    ): Promise<ComboPricingResponseDto> {
      return this.service.create(dto);
    }
  
    // GET ALL
    @Get()
    async findAll(): Promise<ComboPricingResponseDto[]> {
      return this.service.findAll();
    }
  
    // GET ONE
    @Get(':id')
    async findOne(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<ComboPricingResponseDto> {
      return this.service.findOne(id);
    }
  
    // 🔥 GET BY COMBO
    @Get('combo/:comboId')
    async findByCombo(
      @Param('comboId', ParseIntPipe) comboId: number,
    ): Promise<ComboPricingResponseDto> {
      return this.service.findByCombo(comboId);
    }
  
    // UPDATE
    @Patch(':id')
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateComboPricingDto,
    ): Promise<ComboPricingResponseDto> {
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