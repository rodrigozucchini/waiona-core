import { Controller, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CalculationService } from '../services/calculation.service';
import { CalculatePreviewDto } from '../dto/calculate-preview.dto';
import { CalculateProductDto } from '../dto/calculate-product.dto';
import { CalculateComboDto } from '../dto/calculate-combo.dto';

@Controller('pricing/calculate')
export class CalculationController {
  constructor(private readonly calculationService: CalculationService) {}

  // ==========================
  // PREVIEW
  // ==========================

  @Post('preview')
  preview(@Body() dto: CalculatePreviewDto) {
    return this.calculationService.preview(dto);
  }

  // ==========================
  // PRODUCT
  // ==========================

  @Post('product')
  calculateProduct(@Body() dto: CalculateProductDto) {
    return this.calculationService.calculateProduct(dto);
  }

  // ==========================
  // COMBO
  // ==========================

  @Post('combo')
  calculateCombo(@Body() dto: CalculateComboDto) {
    return this.calculationService.calculateCombo(dto);
  }
}