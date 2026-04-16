import { ShopItemResponseDto } from './shop-response.dto';

export class ShopPaginatedResponseDto {
  total: number;
  page: number;
  limit: number;
  data: ShopItemResponseDto[];
}