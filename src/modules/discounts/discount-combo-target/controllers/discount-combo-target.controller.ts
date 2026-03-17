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
  
  import { DiscountComboTargetService } from '../services/discount-combo-target.service';
  import { CreateDiscountComboTargetDto } from '../dto/create-discount-combo-target.dto';
  import { UpdateDiscountComboTargetDto } from '../dto/update-discount-combo-target.dto';
  import { DiscountComboTargetResponseDto } from '../dto/discount-combo-target.dto';
  
  @Controller('discount-combo-targets')
  export class DiscountComboTargetController {
  
    constructor(
      private readonly service: DiscountComboTargetService,
    ) {}
  
    @Post()
    async create(@Body() dto: CreateDiscountComboTargetDto) {
      const entity = await this.service.create(dto);
      return new DiscountComboTargetResponseDto(entity);
    }
  
    @Get()
    async findAll() {
      const entities = await this.service.findAll();
      return entities.map(e => new DiscountComboTargetResponseDto(e));
    }
  
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
      const entity = await this.service.findOne(id);
      return new DiscountComboTargetResponseDto(entity);
    }
  
    @Get('combo/:comboId')
    async findByCombo(
      @Param('comboId', ParseIntPipe) comboId: number,
    ) {
      const entity = await this.service.findByCombo(comboId);
      return entity
        ? new DiscountComboTargetResponseDto(entity)
        : null;
    }
  
    @Patch(':id')
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateDiscountComboTargetDto,
    ) {
      const entity = await this.service.update(id, dto);
      return new DiscountComboTargetResponseDto(entity);
    }
  
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
      const entity = await this.service.remove(id);
      return new DiscountComboTargetResponseDto(entity);
    }
  }