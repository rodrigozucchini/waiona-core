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
  UseGuards,
} from '@nestjs/common';

import { ComboTaxesService } from '../services/combo-taxes.service';
import { CreateComboTaxDto } from '../dto/create-combo-taxes.dto';
import { UpdateComboTaxDto } from '../dto/update-combo-taxes.dto';
import { ComboTaxResponseDto } from '../dto/combo-taxes-response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleType } from 'src/common/enums/role-type.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
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