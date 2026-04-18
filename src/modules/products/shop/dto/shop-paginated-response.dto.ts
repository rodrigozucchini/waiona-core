import { ShopItemResponseDto } from './shop-response.dto';
 
export class ShopPaginatedResponseDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;           // 🔥 faltaba — Math.ceil(total / limit)
  hasNextPage: boolean;         // 🔥 faltaba — page < totalPages
  data: ShopItemResponseDto[];
}
 