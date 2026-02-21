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

import { TaxTypesService } from '../services/tax-types.service';
import { CreateTaxTypeDto } from '../dto/create-tax-type.dto';
import { UpdateTaxTypeDto } from '../dto/update-tax-type.dto';

@Controller('tax-types')
export class TaxTypesController {
  constructor(private taxTypesService: TaxTypesService) {}

  @Get()
  getTaxTypes() {
    return this.taxTypesService.findAll();
  }

  @Get(':id')
  findTaxType(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.taxTypesService.findById(id);
  }

  @Post()
  createTaxType(
    @Body() body: CreateTaxTypeDto,
  ) {
    return this.taxTypesService.create(body);
  }

  @Put(':id')
  updateTaxType(
    @Param('id', ParseIntPipe) id: number,
    @Body() changes: UpdateTaxTypeDto,
  ) {
    return this.taxTypesService.update(id, changes);
  }

  @Delete(':id')
  deleteTaxType(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.taxTypesService.delete(id);
  }
}