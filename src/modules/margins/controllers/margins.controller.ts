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
  
  import { MarginsService } from '../services/margins.service';
  import { CreateMarginDto } from '../dto/create-margin.dto';
  import { UpdateMarginDto } from '../dto/update-margin.dto';
  import { MarginResponseDto } from '../dto/response-margin.dto';
  
  @Controller('margins')
  export class MarginsController {
    constructor(private readonly marginsService: MarginsService) {}
  
    // CREATE
    @Post()
    async create(
      @Body() dto: CreateMarginDto,
    ): Promise<MarginResponseDto> {
      return this.marginsService.create(dto);
    }
  
    // GET ALL
    @Get()
    async findAll(): Promise<MarginResponseDto[]> {
      return this.marginsService.findAll();
    }
  
    // GET ONE
    @Get(':id')
    async findOne(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<MarginResponseDto> {
      return this.marginsService.findOne(id);
    }
  
    // UPDATE (parcial)
    @Patch(':id')
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateMarginDto,
    ): Promise<MarginResponseDto> {
      return this.marginsService.update(id, dto);
    }
  
    // SOFT DELETE
    @Delete(':id')
    async remove(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
      return this.marginsService.remove(id);
    }
  }