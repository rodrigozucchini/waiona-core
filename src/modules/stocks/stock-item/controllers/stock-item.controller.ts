import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';

import { StockItemsService } from '../services/stock-item.service';

import { CreateStockItemDto } from '../dto/create-stock-item.dto';
import { UpdateStockThresholdsDto } from '../dto/update-stock-thresholds.dto';
import { StockItemAddStockDto } from '../dto/stock-item-add-stock.dto'; // 🔥
import { StockItemWriteOffDto } from '../dto/stock-item-write-off.dto'; // 🔥

import { StockItemResponseDto } from '../dto/stock-item-response.dto';
import { StockItemWithMovementsResponseDto } from '../dto/stock-item-with-movements-response.dto';

import { CreateStockWriteOffDto } from '../../stock-writeoff/dto/create-stock-writeoff.dto';

import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleType } from 'src/common/enums/role-type.enum';

@Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('stock-items')
export class StockItemsController {

  constructor(
    private readonly stockItemsService: StockItemsService,
  ) {}

  @Get()
  async findAll(): Promise<StockItemResponseDto[]> {
    return this.stockItemsService.findAll();
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StockItemWithMovementsResponseDto> {
    return this.stockItemsService.findById(id);
  }

  @Post()
  async create(
    @Body() dto: CreateStockItemDto,
  ): Promise<StockItemResponseDto> {
    return this.stockItemsService.create(dto);
  }

  @Post('add-stock')
  async addStock(
    @Body() dto: StockItemAddStockDto, // 🔥
  ): Promise<StockItemWithMovementsResponseDto> {
    return this.stockItemsService.addStock(
      dto.productId,
      dto.locationId,
      dto.quantity,
    );
  }

  @Post('write-off')
  async writeOff(
    @Body() dto: StockItemWriteOffDto, // 🔥
  ): Promise<StockItemWithMovementsResponseDto> {
    return this.stockItemsService.writeOff(
      dto.stockItemId,
      dto.quantity,
    );
  }

  @Post('write-off-damage')
  async writeOffDamage(
    @Body() dto: CreateStockWriteOffDto,
  ): Promise<StockItemWithMovementsResponseDto> {
    return this.stockItemsService.writeOffDamage(dto);
  }

  @Patch(':id/thresholds')
  async updateThresholds(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStockThresholdsDto,
  ): Promise<StockItemResponseDto> {
    return this.stockItemsService.updateThresholds(id, dto);
  }
}