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
  
  import { ComboTaxesService } from '../services/combo-taxes.service';
  
  import { CreateComboTaxDto } from '../dto/create-combo-taxes.dto';
  import { UpdateComboTaxDto } from '../dto/update-combo-taxes.dto';
  import { ComboTaxResponseDto } from '../dto/combo-taxes-response.dto';
  
  @Controller('combo-taxes')
  export class ComboTaxesController {
  
    constructor(
      private readonly comboTaxesService: ComboTaxesService,
    ) {}
  
    // ==========================
    // GET ALL
    // ==========================
  
    @Get()
    async findAll(): Promise<ComboTaxResponseDto[]> {
      return this.comboTaxesService.findAll();
    }
  
    // ==========================
    // GET BY ID
    // ==========================
  
    @Get(':id')
    async findOne(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<ComboTaxResponseDto> {
  
      return this.comboTaxesService.findOne(id);
    }
  
    // ==========================
    // CREATE
    // ==========================
  
    @Post()
    async create(
      @Body() dto: CreateComboTaxDto,
    ): Promise<ComboTaxResponseDto> {
  
      return this.comboTaxesService.create(dto);
    }
  
    // ==========================
    // UPDATE
    // ==========================
  
    @Patch(':id')
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateComboTaxDto,
    ): Promise<ComboTaxResponseDto> {
  
      return this.comboTaxesService.update(id, dto);
    }
  
    // ==========================
    // SOFT DELETE
    // ==========================
  
    @Delete(':id')
    async remove(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
  
      return this.comboTaxesService.remove(id);
    }
  
  }