export class ShopItemResponseDto {
    id: number;
    name: string;
    price: number;
    type: 'product' | 'combo';
    category?: string;
    image?: string;
  }