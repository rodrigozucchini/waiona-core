export class ShopItemResponseDto {
  id: number;
  name: string;
  type: 'product' | 'combo';
 
  // 💰 precios
  originalPrice: number;       // unitPrice (precio base sin descuento)
  finalPrice: number;          // precio final con impuestos y margen
  discountAmount: number;      // monto descontado (0 si no hay descuento)
  hasDiscount: boolean;        // true solo si discount > 0
 
  // 📦 stock
  inStock: boolean;            // true si quantityAvailable > 0
  quantityAvailable: number;   // cantidad disponible real
 
  // 🏷️ categoría (solo products)
  category?: string;
 
  // 🖼️ primera imagen
  image?: string;
}
 