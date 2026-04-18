import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';

import { ShopService } from '../services/shop.service';
import { SearchShopDto } from '../dto/search-shop.dto';
import { ShopPaginatedResponseDto } from '../dto/shop-paginated-response.dto';
import { ShopDetailResponseDto } from '../dto/shop-detail-response.dto';

@Controller('shop')
export class ShopController {

  constructor(
    private readonly shopService: ShopService,
  ) {}

  // ==========================
  // GET /shop/items
  // ==========================
  @Get('items')
  async search(
    @Query() query: SearchShopDto,
  ): Promise<ShopPaginatedResponseDto> {

    return this.shopService.search(query);
  }

  // ==========================
  // GET /shop/items/:id
  // ==========================
  @Get('items/:id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Query('type') type: 'product' | 'combo',
  ): Promise<ShopDetailResponseDto> {

    return this.shopService.findById(id, type);
  }
}