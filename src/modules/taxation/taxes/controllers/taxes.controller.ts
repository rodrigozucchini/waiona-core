import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';

import { TaxesService } from '../services/taxes.service';

import { CreateTaxDto } from '../dto/create-tax.dto';
import { UpdateTaxDto } from '../dto/update-tax.dto';
import { TaxResponseDto } from '../dto/tax-response.dto';

@Controller('taxes')
export class TaxesController {

  constructor(
    private readonly taxesService: TaxesService,
  ) {}

  // ==========================
  // GET ALL
  // ==========================

  @Get()
  async findAll(): Promise<TaxResponseDto[]> {
    return this.taxesService.findAll();
  }

  // ==========================
  // GET BY ID
  // ==========================

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TaxResponseDto> {
    return this.taxesService.findById(id);
  }

  // ==========================
  // CREATE
  // ==========================

  @Post()
  async create(
    @Body() dto: CreateTaxDto,
  ): Promise<TaxResponseDto> {
    return this.taxesService.create(dto);
  }

  // ==========================
  // UPDATE (PATCH)
  // ==========================

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaxDto,
  ): Promise<TaxResponseDto> {
    return this.taxesService.update(id, dto);
  }

  // ==========================
  // SOFT DELETE
  // ==========================

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.taxesService.delete(id);
  }

}