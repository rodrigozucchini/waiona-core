import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
    ParseIntPipe,
  } from '@nestjs/common';
  
  import { ComboImageService } from '../services/combo-image.service';
  
  import { CreateComboImageDto } from '../dto/create-combo-image.dto';
  import { UpdateComboImageDto } from '../dto/update-combo-image.dto';
  import { ComboImageResponseDto } from '../dto/combo-image-response.dto';
  
  @Controller('combo-images')
  export class ComboImageController {
    constructor(
      private readonly comboImageService: ComboImageService,
    ) {}
  
    // CREATE
    @Post()
    create(
      @Body() dto: CreateComboImageDto,
    ): Promise<ComboImageResponseDto> {
      return this.comboImageService.create(dto);
    }
  
    // GET ALL BY COMBO
    @Get('/combo/:comboId')
    findByCombo(
      @Param('comboId', ParseIntPipe) comboId: number,
    ): Promise<ComboImageResponseDto[]> {
      return this.comboImageService.findByCombo(comboId);
    }
  
    // GET BY ID
    @Get(':id')
    findOne(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<ComboImageResponseDto> {
      return this.comboImageService.findOne(id);
    }
  
    // UPDATE
    @Patch(':id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateComboImageDto,
    ): Promise<ComboImageResponseDto> {
      return this.comboImageService.update(id, dto);
    }
  
    // SOFT DELETE
    @Delete(':id')
    remove(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
      return this.comboImageService.remove(id);
    }
  }