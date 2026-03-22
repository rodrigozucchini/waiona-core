import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { TaxTypesService } from '../services/tax-types.service';
import { CreateTaxTypeDto } from '../dto/create-tax-type.dto';
import { UpdateTaxTypeDto } from '../dto/update-tax-type.dto';
import { TaxTypeResponseDto } from '../dto/tax-type-response.dto';

@Controller('tax-types')
export class TaxTypesController {
  constructor(private taxTypesService: TaxTypesService) {}

  @Get()
  getTaxTypes(): Promise<TaxTypeResponseDto[]> {
    return this.taxTypesService.findAll();
  }

  @Get(':id')
  findTaxType(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TaxTypeResponseDto> {
    return this.taxTypesService.findById(id);
  }

  @Post()
  createTaxType(
    @Body() body: CreateTaxTypeDto,
  ): Promise<TaxTypeResponseDto> {
    return this.taxTypesService.create(body);
  }

  @Put(':id')
  updateTaxType(
    @Param('id', ParseIntPipe) id: number,
    @Body() changes: UpdateTaxTypeDto,
  ): Promise<TaxTypeResponseDto> {
    return this.taxTypesService.update(id, changes);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTaxType(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.taxTypesService.delete(id);
  }
}