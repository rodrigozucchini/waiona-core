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

import { ProductTaxesService } from '../services/product-taxes.service';
import { CreateProductTaxDto } from '../dto/create-product-tax.dto';
import { UpdateProductTaxDto } from '../dto/update-product-tax.dto';
import { ProductTaxResponseDto } from '../dto/product-tax-response.dto';

@Controller('products/:productId/taxes')
export class ProductTaxesController {

  constructor(
    private readonly productTaxesService: ProductTaxesService,
  ) {}

  @Get()
  findAll(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<ProductTaxResponseDto[]> {
    return this.productTaxesService.findAll(productId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductTaxResponseDto> {
    return this.productTaxesService.findOne(id);
  }

  @Post()
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateProductTaxDto,
  ): Promise<ProductTaxResponseDto> {
    return this.productTaxesService.create({ ...dto, productId });
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductTaxDto,
  ): Promise<ProductTaxResponseDto> {
    return this.productTaxesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.productTaxesService.remove(id);
  }
}