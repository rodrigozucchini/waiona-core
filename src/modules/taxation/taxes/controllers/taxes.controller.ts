import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { TaxesService } from '../services/taxes.service';
import { CreateTaxDto } from '../dto/create-tax.dto';
import { UpdateTaxDto } from '../dto/update-tax.dto';
import { TaxResponseDto } from '../dto/tax-response.dto';

@Controller('tax-types/:taxTypeId/taxes')
export class TaxesController {

  constructor(private readonly taxesService: TaxesService) {}

  // ==========================
  // GET ALL
  // ==========================

  @Get()
  findAll(
    @Param('taxTypeId', ParseIntPipe) taxTypeId: number,
  ): Promise<TaxResponseDto[]> {
    return this.taxesService.findAll(taxTypeId);
  }

  // ==========================
  // GET BY ID
  // ==========================

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TaxResponseDto> {
    return this.taxesService.findById(id);
  }

  // ==========================
  // CREATE
  // ==========================

  @Post()
  create(
    @Param('taxTypeId', ParseIntPipe) taxTypeId: number,
    @Body() dto: CreateTaxDto,
  ): Promise<TaxResponseDto> {
    return this.taxesService.create(taxTypeId, dto);
  }

  // ==========================
  // UPDATE
  // ==========================

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaxDto,
  ): Promise<TaxResponseDto> {
    return this.taxesService.update(id, dto);
  }

  // ==========================
  // DELETE
  // ==========================

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.taxesService.delete(id);
  }
}