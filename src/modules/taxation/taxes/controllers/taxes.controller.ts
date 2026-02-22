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
  
  import { TaxesService } from '../services/taxes.service';
  
  import { CreateTaxDto } from '../dto/create-tax.dto';
  import { UpdateTaxDto } from '../dto/update-tax.dto';
  
  @Controller('taxes')
  export class TaxesController {
  
    constructor(
      private taxesService: TaxesService,
    ) {}
  
    @Get()
    getTaxes() {
      return this.taxesService.findAll();
    }
  
    @Get(':id')
    findTax(
      @Param('id', ParseIntPipe) id: number,
    ) {
      return this.taxesService.findById(id);
    }
  
    @Post()
    createTax(
      @Body() body: CreateTaxDto,
    ) {
      return this.taxesService.create(body);
    }
  
    @Put(':id')
    updateTax(
      @Param('id', ParseIntPipe) id: number,
      @Body() changes: UpdateTaxDto,
    ) {
      return this.taxesService.update(id, changes);
    }
  
    @Delete(':id')
    deleteTax(
      @Param('id', ParseIntPipe) id: number,
    ) {
      return this.taxesService.delete(id);
    }
  
  }