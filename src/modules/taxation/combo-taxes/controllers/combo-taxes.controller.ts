import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { ComboTaxesService } from '../services/combo-taxes.service';
import { CreateComboTaxDto } from '../dto/create-combo-taxes.dto';
import { UpdateComboTaxDto } from '../dto/update-combo-taxes.dto';
import { ComboTaxResponseDto } from '../dto/combo-taxes-response.dto';

@Controller('combos/:comboId/taxes')
export class ComboTaxesController {

  constructor(
    private readonly comboTaxesService: ComboTaxesService,
  ) {}

  @Get()
  findAll(
    @Param('comboId', ParseIntPipe) comboId: number,
  ): Promise<ComboTaxResponseDto[]> {
    return this.comboTaxesService.findAll(comboId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ComboTaxResponseDto> {
    return this.comboTaxesService.findOne(id);
  }

  @Post()
  create(
    @Param('comboId', ParseIntPipe) comboId: number,
    @Body() dto: CreateComboTaxDto,
  ): Promise<ComboTaxResponseDto> {
    return this.comboTaxesService.create({ ...dto, comboId });
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateComboTaxDto,
  ): Promise<ComboTaxResponseDto> {
    return this.comboTaxesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.comboTaxesService.remove(id);
  }
}