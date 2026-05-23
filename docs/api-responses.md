# Waiona API — Response Shapes

Todos los responses de la API. Los endpoints de lista usan el wrapper paginado salvo que se indique lo contrario.

---

## Wrapper paginado

Todos los `GET` de lista devuelven:

```json
{
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1,
  "hasNextPage": false,
  "data": [ ...items ]
}
```

---

## Auth — `POST /v1/auth/*`

### `POST /v1/auth/register` → 201
```json
{ "message": "Registration successful — check your email to activate your account" }
```

### `GET /v1/auth/activate?token=...` → 200
```json
{ "message": "Account activated successfully" }
```

### `POST /v1/auth/login` → 200
```json
{
  "user": {
    "id": 1,
    "email": "juan@example.com",
    "isActive": true,
    "profileId": 1,
    "profile": {
      "id": 1,
      "name": "Juan",
      "lastName": "Pérez",
      "avatar": null
    },
    "roleId": 1,
    "role": {
      "id": 1,
      "type": "super_admin"
    },
    "createdAt": "2026-05-23T00:00:00.000Z",
    "updatedAt": "2026-05-23T00:00:00.000Z"
  },
  "access_token": "<jwt>",
  "refresh_token": "<token>"
}
```

### `POST /v1/auth/refresh` → 200
```json
{
  "access_token": "<jwt>",
  "refresh_token": "<nuevo_token>"
}
```

### `POST /v1/auth/logout` → 204 (sin body)

### `POST /v1/auth/logout-all` → 204 (sin body)

### `POST /v1/auth/forgot-password` → 200
```json
{ "message": "If the email exists, you will receive a reset link shortly" }
```

### `POST /v1/auth/reset-password` → 200
```json
{ "message": "Password reset successfully" }
```

### `PATCH /v1/auth/change-password` → 200
```json
{ "message": "Password changed successfully" }
```

---

## Users — `GET /v1/users`

### `GET /v1/users` → 200 (paginado)
```json
{
  "total": 2,
  "page": 1,
  "limit": 20,
  "totalPages": 1,
  "hasNextPage": false,
  "data": [
    {
      "id": 1,
      "email": "juan@example.com",
      "isActive": true,
      "role": "super_admin",
      "profile": {
        "id": 1,
        "name": "Juan",
        "lastName": "Pérez",
        "avatar": null
      },
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

### `GET /v1/users/:id` → 200 (mismo objeto sin wrapper)

---

## Products — `GET /v1/products`

### `GET /v1/products` → 200 (paginado)
```json
{
  "data": [
    {
      "id": 1,
      "sku": "PROD-001",
      "name": "Coca Cola 500ml",
      "description": "Gaseosa negra 500ml",
      "isActive": true,
      "categoryId": 1,
      "categoryName": "Bebidas",
      "measurementUnit": "unit",
      "measurementValue": null,
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

### `GET /v1/products/:id` → 200 (mismo objeto sin wrapper)

---

## Categories — `GET /v1/categories`

### `GET /v1/categories` → 200 (paginado)
```json
{
  "data": [
    {
      "id": 1,
      "name": "Bebidas",
      "description": "Bebidas en general",
      "isActive": true,
      "parentId": null,
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

### `GET /v1/categories/tree` → 200 (array, sin wrapper paginado)
```json
[
  {
    "id": 1,
    "name": "Bebidas",
    "children": [
      {
        "id": 2,
        "name": "Gaseosas",
        "children": []
      }
    ]
  }
]
```

### `GET /v1/categories/:id` → 200 (mismo objeto de lista sin wrapper)

---

## Combos — `GET /v1/combos`

### `GET /v1/combos` → 200 (paginado)
```json
{
  "data": [
    {
      "id": 1,
      "name": "Combo Verano",
      "description": "Tres Cocas 500ml",
      "isActive": true,
      "categoryId": 1,
      "categoryName": "Combos",
      "items": [
        {
          "productId": 1,
          "productName": "Coca Cola 500ml",
          "quantity": 3
        }
      ],
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

### `GET /v1/combos/:id` → 200 (mismo objeto sin wrapper)

---

## Product Images — `GET /v1/product-images`

### `GET /v1/product-images/product/:productId` → 200 (array, sin wrapper paginado)
```json
[
  {
    "id": 1,
    "productId": 1,
    "url": "https://cdn.example.com/img.jpg",
    "position": 1,
    "createdAt": "2026-05-23T00:00:00.000Z",
    "updatedAt": "2026-05-23T00:00:00.000Z"
  }
]
```

### `GET /v1/product-images/:id` → 200 (mismo objeto sin wrapper)

---

## Combo Images — `GET /v1/combo-images`

### `GET /v1/combo-images/combo/:comboId` → 200 (array, sin wrapper paginado)
```json
[
  {
    "id": 1,
    "comboId": 1,
    "url": "https://cdn.example.com/combo.jpg",
    "position": 1,
    "createdAt": "2026-05-23T00:00:00.000Z",
    "updatedAt": "2026-05-23T00:00:00.000Z"
  }
]
```

### `GET /v1/combo-images/:id` → 200 (mismo objeto sin wrapper)

---

## Shop (público) — `GET /v1/shop`

### `GET /v1/shop/items` → 200 (paginado)

Soporta query params: `search`, `type` (`product` | `combo`), `categoryId`, `minPrice`, `maxPrice`, `page`, `limit`.

```json
{
  "total": 5,
  "page": 1,
  "limit": 20,
  "totalPages": 1,
  "hasNextPage": false,
  "data": [
    {
      "id": 1,
      "name": "Coca Cola 500ml",
      "type": "product",
      "originalPrice": 726,
      "finalPrice": 653.4,
      "discountAmount": 72.6,
      "hasDiscount": true,
      "inStock": true,
      "quantityAvailable": 10,
      "category": "Bebidas",
      "image": "https://cdn.example.com/img.jpg"
    }
  ]
}
```

### `GET /v1/shop/items/:id?type=product` → 200
```json
{
  "id": 1,
  "name": "Coca Cola 500ml",
  "description": "Gaseosa negra 500ml",
  "type": "product",
  "originalPrice": 726,
  "finalPrice": 653.4,
  "discountAmount": 72.6,
  "priceAfterDiscount": 653.4,
  "taxes": 113.4,
  "hasDiscount": true,
  "inStock": true,
  "quantityAvailable": 10,
  "stockStatus": "available",
  "images": ["https://cdn.example.com/img.jpg"],
  "items": null
}
```

> `stockStatus`: `"available"` | `"low"` | `"critical"` | `"out_of_stock"`

### `GET /v1/shop/items/:id?type=combo` → 200 (igual, pero `items` viene poblado)
```json
{
  "items": [
    { "productId": 1, "productName": "Coca Cola 500ml", "quantity": 3 }
  ]
}
```

---

## Margins — `GET /v1/margins`

### `GET /v1/margins` → 200 (paginado)
```json
{
  "data": [
    {
      "id": 1,
      "name": "Margen estándar",
      "value": 20,
      "isPercentage": true,
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

### `GET /v1/margins/:id` → 200 (mismo objeto sin wrapper)

---

## Product Pricing — `GET /v1/product-pricing`

### `GET /v1/product-pricing` → 200 (paginado)
```json
{
  "data": [
    {
      "id": 1,
      "productId": 1,
      "currency": "ARS",
      "unitPrice": 500,
      "marginId": null,
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

### `GET /v1/product-pricing/:id` → 200 (mismo objeto sin wrapper)

---

## Combo Pricing — `GET /v1/combo-pricing`

### `GET /v1/combo-pricing` → 200 (paginado)
```json
{
  "data": [
    {
      "id": 1,
      "comboId": 1,
      "currency": "ARS",
      "unitPrice": 1200,
      "marginId": null,
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

### `GET /v1/combo-pricing/:id` → 200 (mismo objeto sin wrapper)

---

## Pricing Calculator — `POST /v1/pricing/calculate`

### `POST /v1/pricing/calculate/product` → 200
### `POST /v1/pricing/calculate/combo` → 200
### `POST /v1/pricing/calculate/preview` → 200

Todos devuelven `PriceBreakdownDto`:
```json
{
  "unitPrice": 500,
  "discount": 50,
  "priceAfterDiscount": 450,
  "margin": 90,
  "priceAfterMargin": 540,
  "taxes": 113.4,
  "finalPrice": 653.4,
  "fullPrice": 726,
  "coupon": 0,
  "orderTotal": 653.4
}
```

> `finalPrice` = precio con descuento que paga el cliente.
> `fullPrice` = precio sin descuento (para mostrar tachado en el front).

---

## Tax Types — `GET /v1/tax-types`

### `GET /v1/tax-types` → 200 (paginado)
```json
{
  "data": [
    {
      "id": 1,
      "code": "IVA",
      "name": "Impuesto al Valor Agregado",
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

---

## Taxes — `GET /v1/tax-types/:taxTypeId/taxes`

### `GET /v1/tax-types/:taxTypeId/taxes` → 200 (paginado)
```json
{
  "data": [
    {
      "id": 1,
      "taxTypeId": 1,
      "value": 21,
      "isPercentage": true,
      "currency": "ARS",
      "isGlobal": true,
      "taxType": {
        "id": 1,
        "code": "IVA",
        "name": "Impuesto al Valor Agregado",
        "createdAt": "2026-05-23T00:00:00.000Z",
        "updatedAt": "2026-05-23T00:00:00.000Z"
      },
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

---

## Product Taxes — `GET /v1/products/:productId/taxes`

### `GET /v1/products/:productId/taxes` → 200 (paginado)
```json
{
  "data": [
    {
      "id": 1,
      "productId": 1,
      "taxId": 1,
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

---

## Combo Taxes — `GET /v1/combos/:comboId/taxes`

### `GET /v1/combos/:comboId/taxes` → 200 (paginado)
```json
{
  "data": [
    {
      "id": 1,
      "comboId": 1,
      "taxId": 1,
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

---

## Discounts — `GET /v1/discounts`

### `GET /v1/discounts` → 200 (paginado)
```json
{
  "data": [
    {
      "id": 1,
      "name": "Black Friday",
      "description": "Descuento de temporada",
      "status": "active",
      "value": 10,
      "isPercentage": true,
      "currency": "ARS",
      "startsAt": "2025-11-01T00:00:00.000Z",
      "endsAt": "2025-11-30T23:59:59.000Z",
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

> `status`: calculado en runtime — `"active"` | `"scheduled"` | `"expired"`

---

## Discount Product Target — `GET /v1/discounts/:discountId/products`

```json
{
  "data": [
    {
      "id": 1,
      "discountId": 1,
      "productId": 3,
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

---

## Discount Combo Target — `GET /v1/discounts/:discountId/combos`

```json
{
  "data": [
    {
      "id": 1,
      "discountId": 1,
      "comboId": 2,
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

---

## Coupons — `GET /v1/coupons`

### `GET /v1/coupons` → 200 (paginado)
```json
{
  "data": [
    {
      "id": 1,
      "code": "PROMO10",
      "status": "active",
      "value": 10,
      "isPercentage": true,
      "currency": "ARS",
      "isGlobal": false,
      "usageLimit": 100,
      "usageCount": 5,
      "startsAt": null,
      "endsAt": null,
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

> `status`: calculado en runtime — `"active"` | `"scheduled"` | `"expired"` | `"exhausted"`

---

## Coupon Product Target — `GET /v1/coupons/:couponId/products`

```json
{
  "data": [
    {
      "id": 1,
      "couponId": 1,
      "productId": 3,
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

---

## Coupon Combo Target — `GET /v1/coupons/:couponId/combos`

```json
{
  "data": [
    {
      "id": 1,
      "couponId": 1,
      "comboId": 2,
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

---

## Coupon Usage — `GET /v1/coupons/:couponId/usages`

```json
{
  "data": [
    {
      "id": 1,
      "couponId": 1,
      "orderId": 42,
      "userId": 7,
      "appliedAt": "2026-05-23T00:00:00.000Z",
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

---

## Stock Locations — `GET /v1/stock-locations`

### `GET /v1/stock-locations` → 200 (paginado)
```json
{
  "data": [
    {
      "id": 1,
      "name": "Depósito Central",
      "type": "WAREHOUSE",
      "address": "Av. Corrientes 1234",
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

> `type`: `"WAREHOUSE"` | `"STORE"` | `"VIRTUAL"`

---

## Stock Items — `GET /v1/stock-items`

### `GET /v1/stock-items` → 200 (paginado)
```json
{
  "data": [
    {
      "id": 1,
      "productId": 1,
      "locationId": 1,
      "locationName": "Depósito Central",
      "quantityCurrent": 100,
      "quantityReserved": 5,
      "quantityAvailable": 95,
      "stockMin": 10,
      "stockCritical": 5,
      "stockMax": 200,
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

### `GET /v1/stock-items/:id` → 200 (incluye historial de movimientos)
```json
{
  "id": 1,
  "productId": 1,
  "locationId": 1,
  "locationName": "Depósito Central",
  "quantityCurrent": 100,
  "quantityReserved": 5,
  "quantityAvailable": 95,
  "stockMin": 10,
  "stockCritical": 5,
  "stockMax": 200,
  "movements": [
    {
      "id": 1,
      "stockItemId": 1,
      "operationType": "ENTRY",
      "stockFlow": "INBOUND",
      "quantity": 20,
      "referenceType": "MANUAL",
      "referenceId": null,
      "createdAt": "2026-05-23T00:00:00.000Z"
    }
  ],
  "createdAt": "2026-05-23T00:00:00.000Z",
  "updatedAt": "2026-05-23T00:00:00.000Z"
}
```

> `operationType`: `"ENTRY"` | `"EXIT"` | `"ADJUSTMENT"` | `"DAMAGE"` | `"RETURN"`
> `stockFlow`: `"INBOUND"` | `"OUTBOUND"`
> `referenceType`: `"MANUAL"` | `"ORDER"`

---

## Stock Movements — `GET /v1/stock-movements`

### `GET /v1/stock-movements` → 200 (paginado)
### `GET /v1/stock-movements/stock-item/:stockItemId` → 200 (paginado)
```json
{
  "data": [
    {
      "id": 1,
      "stockItemId": 1,
      "operationType": "ENTRY",
      "stockFlow": "INBOUND",
      "quantity": 20,
      "referenceType": "MANUAL",
      "referenceId": null,
      "createdAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

---

## Stock Write-Offs — `GET /v1/stock-write-offs`

### `GET /v1/stock-write-offs` → 200 (paginado)
```json
{
  "data": [
    {
      "id": 1,
      "stockItemId": 1,
      "movementId": 5,
      "quantity": 3,
      "reason": "DAMAGE",
      "description": "Cajas rotas en tránsito",
      "attachments": ["https://cdn.example.com/foto.jpg"],
      "reportedBy": 1,
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

> `reason`: `"DAMAGE"` | `"EXPIRY"` | `"LOSS"` | `"OTHER"`

---

## Orders — `GET /v1/orders`

### `GET /v1/orders` → 200 (paginado)
### `GET /v1/orders/user/:userId` → 200 (paginado)
```json
{
  "data": [
    {
      "id": 1,
      "createdAt": "2026-05-23T00:00:00.000Z",
      "updatedAt": "2026-05-23T00:00:00.000Z",
      "userId": 3,
      "status": "pending",
      "deliveryType": "pickup",
      "address": null,
      "notes": null,
      "subtotal": 200,
      "couponDiscount": null,
      "couponCode": null,
      "total": 200,
      "items": [
        {
          "id": 1,
          "productId": 1,
          "productName": "Coca Cola 500ml",
          "comboId": null,
          "comboName": null,
          "quantity": 2,
          "unitPrice": 100,
          "finalPrice": 200
        }
      ]
    }
  ]
}
```

> `status`: `"pending"` | `"confirmed"` | `"dispatched"` | `"delivered"` | `"cancelled"`
> `deliveryType`: `"pickup"` | `"delivery"`

### `GET /v1/orders/:id` → 200 (mismo objeto sin wrapper)

---

## Payments — `GET /v1/payments`

### `GET /v1/payments/order/:orderId` → 200 (array, sin wrapper paginado)
### `GET /v1/payments/:id` → 200
```json
{
  "id": 1,
  "orderId": 42,
  "provider": "mercadopago",
  "status": "pending",
  "externalId": "pref_abc123",
  "checkoutUrl": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref_abc123",
  "amount": 4950,
  "createdAt": "2026-05-23T00:00:00.000Z",
  "updatedAt": "2026-05-23T00:00:00.000Z"
}
```

> `status`: `"pending"` | `"approved"` | `"rejected"` | `"cancelled"`

---

## Analytics — `GET /v1/analytics`

### `GET /v1/analytics/orders` → 200
```json
{
  "total": 15,
  "byStatus": {
    "pending": 3,
    "confirmed": 2,
    "dispatched": 1,
    "delivered": 8,
    "cancelled": 1
  },
  "totalRevenue": 45000,
  "revenueToday": 1200,
  "revenueThisMonth": 18000
}
```

### `GET /v1/analytics/products/top` → 200 (array, soporta `?limit=10`)
```json
[
  {
    "productId": 1,
    "name": "Coca Cola 500ml",
    "sku": "PROD-001",
    "totalSold": 42
  }
]
```

### `GET /v1/analytics/stock/critical` → 200 (array)
```json
[
  {
    "id": 1,
    "productId": 1,
    "productName": "Coca Cola 500ml",
    "sku": "PROD-001",
    "locationId": 1,
    "locationName": "Depósito Central",
    "quantityCurrent": 1,
    "quantityReserved": 0,
    "quantityAvailable": 1,
    "stockCritical": 2,
    "stockMin": 5
  }
]
```

---

## Errores estándar

```json
{ "statusCode": 400, "error": "Bad Request",  "message": ["campo must be..."], "timestamp": "...", "path": "..." }
{ "statusCode": 401, "error": "UNAUTHORIZED",  "message": "Unauthorized",       "timestamp": "...", "path": "..." }
{ "statusCode": 403, "error": "Forbidden",     "message": "Access denied",      "timestamp": "...", "path": "..." }
{ "statusCode": 404, "error": "Not Found",     "message": "X with id Y not found", "timestamp": "...", "path": "..." }
{ "statusCode": 409, "error": "Conflict",      "message": "...",                "timestamp": "...", "path": "..." }
{ "statusCode": 429, "error": "Too Many Requests", "message": "ThrottlerException: Too Many Requests", "timestamp": "...", "path": "..." }
```
