export class ShopDetailResponseDto {
  id: number;
  name: string;
  description: string;         // 🔥 antes nunca se asignaba en el service
 
  type: 'product' | 'combo';
 
  // 💰 precios
  originalPrice: number;       // unitPrice (precio base sin descuento)
  finalPrice: number;          // precio final con impuestos y margen
  discountAmount: number;      // monto descontado (0 si no hay descuento)
  priceAfterDiscount: number;  // precio luego del descuento, antes de margen e impuestos
  taxes: number;               // total impuestos aplicados
  hasDiscount: boolean;        // 🔥 antes era finalPrice < unitPrice (incorrecto)
                               //    correcto: discountAmount > 0
 
  // 📦 stock
  inStock: boolean;            // true si quantityAvailable > 0
  quantityAvailable: number;   // cantidad disponible real
  stockStatus: 'available' | 'low' | 'critical' | 'out_of_stock';
  // available   → quantityAvailable > stockMin
  // low         → quantityAvailable <= stockMin && > stockCritical
  // critical    → quantityAvailable <= stockCritical && > 0
  // out_of_stock → quantityAvailable === 0
 
  // 🖼️ imágenes (ordenadas por position)
  images: string[];
 
  // solo combos
  items?: ComboItemShopDto[];
}
 
export class ComboItemShopDto {
  productId: number;
  productName: string;
  quantity: number;
}