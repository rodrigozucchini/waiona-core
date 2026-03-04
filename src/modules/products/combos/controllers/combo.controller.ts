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
  
  import { ComboService } from '../services/combo.service';
  
  import { CreateComboDto } from '../dto/create-combo.dto';
  import { UpdateComboDto } from '../dto/update-combo.dto';
  import { ComboResponseDto } from '../dto/combo-response.dto';
  
  @Controller('combos')
  export class ComboController {
  
    constructor(
      private readonly comboService: ComboService,
    ) {}
  
    // ==========================
    // GET ALL
    // ==========================
  
    @Get()
    async findAll(): Promise<ComboResponseDto[]> {
      return this.comboService.findAll();
    }
  
    // ==========================
    // GET BY ID
    // ==========================
  
    @Get(':id')
    async findById(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<ComboResponseDto> {
      return this.comboService.findById(id);
    }
  
    // ==========================
    // CREATE
    // ==========================
  
    @Post()
    async create(
      @Body() body: CreateComboDto,
    ): Promise<ComboResponseDto> {
      return this.comboService.create(body);
    }
  
    // ==========================
    // UPDATE
    // ==========================
  
    @Put(':id')
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() body: UpdateComboDto,
    ): Promise<ComboResponseDto> {
      return this.comboService.update(id, body);
    }
  
    // ==========================
    // DELETE (soft)
    // ==========================
  
    @Delete(':id')
    async delete(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
      return this.comboService.delete(id);
    }
  }