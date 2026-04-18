import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
    ParseIntPipe,
    UseGuards,
  } from '@nestjs/common';
  
  import { ComboImageService } from '../services/combo-image.service';
  
  import { CreateComboImageDto } from '../dto/create-combo-image.dto';
  import { UpdateComboImageDto } from '../dto/update-combo-image.dto';
  import { ComboImageResponseDto } from '../dto/combo-image-response.dto';
  import { Roles } from 'src/common/decorators/roles.decorator';
  import { RoleType } from 'src/common/enums/role-type.enum';
  import { AuthGuard } from '@nestjs/passport';
  import { RolesGuard } from 'src/common/guards/roles.guard';
  
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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