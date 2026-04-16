export class ShopDetailResponseDto {
    id: number;
    name: string;
    description?: string;
  
    type: 'product' | 'combo';
  
    // 💰 precios
    basePrice: number;
    finalPrice: number;
    discount?: number;
  
    // 🖼️ imágenes
    images: string[];
  
    // opcional
    hasDiscount: boolean;
  }