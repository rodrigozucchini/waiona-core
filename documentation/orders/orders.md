# Orders — Análisis Técnico Completo

## ¿Qué es el módulo orders?

El módulo de órdenes gestiona el ciclo de vida de los pedidos en Waiona: creación por el cliente, seguimiento de estados por el administrador, reserva y liberación de stock, y aplicación de cupones con transacción atómica. Es el núcleo operativo de la plataforma — conecta productos, stock, precios, cupones y pagos.

```
POST   /v1/orders                 → cliente crea pedido (throttle: 5 req/60s)
GET    /v1/orders                 → admin lista pedidos paginados
GET    /v1/orders/user/:userId    → cliente ve sus pedidos / admin ve los de cualquier usuario
GET    /v1/orders/:id             → cliente ve propia orden / admin ve cualquier orden
PATCH  /v1/orders/:id/status      → admin avanza el estado de la orden
```

### Máquina de estados

```
PENDING ──→ CONFIRMED ──→ DISPATCHED ──→ DELIVERED
   └──────→ CANCELLED
              └──────────→ CANCELLED
```

Cada transición tiene efectos secundarios en stock y cupones (ver reglas de negocio).

---

## Tipos de datos

### `OrderEntity`

```typescript
{
  id:             number;        // PK autoincrement (BaseEntity)
  createdAt:      Date;
  updatedAt:      Date;
  isDeleted:      boolean;       // soft delete (BaseEntity)

  userId:         number;        // FK → users.id (RESTRICT)
  user:           UserEntity;    // ManyToOne, onDelete: RESTRICT

  couponId?:      number | null; // FK → coupons.id (RESTRICT), nullable
  coupon?:        CouponEntity | null;

  items:          OrderItemEntity[];  // OneToMany, cascade: true

  status:         OrderStatus;   // enum: PENDING|CONFIRMED|DISPATCHED|DELIVERED|CANCELLED
  deliveryType:   DeliveryType;  // enum: PICKUP|DELIVERY

  address?:       string | null; // requerido si deliveryType = DELIVERY, max 500 chars
  notes?:         string | null; // texto libre, max 500 chars

  subtotal:       number;        // decimal(12,2) — suma de finalPrice de todos los items
  couponDiscount?: number | null; // decimal(12,2) — monto del descuento aplicado
  total:          number;        // decimal(12,2) — subtotal - couponDiscount (mínimo 0)
}
```

### `OrderItemEntity`

```typescript
{
  id:               number;
  orderId:          number;        // FK → orders.id (CASCADE)
  order:            OrderEntity;

  productId?:       number | null; // FK → products.id (RESTRICT), nullable
  product?:         ProductEntity | null;

  comboId?:         number | null; // FK → combos.id (RESTRICT), nullable
  combo?:           ComboEntity | null;

  quantity:         number;        // int
  unitPrice:        number;        // decimal(12,2) — precio unitario al momento de compra
  finalPrice:       number;        // decimal(12,2) — unitPrice * quantity (snapshot)

  locationId?:      number | null; // FK → stock_locations.id — para dispatch individual de producto
  comboReservations?: Array<{      // JSON — reservas por componente del combo
    productId: number;
    locationId: number;
    quantity: number;
  }> | null;
}
```

### `OrderResponseDto`

```typescript
{
  id:             number;
  createdAt:      Date;
  updatedAt:      Date;
  userId:         number;
  status:         OrderStatus;
  deliveryType:   DeliveryType;
  address:        string | null;
  notes:          string | null;
  subtotal:       number;
  couponDiscount: number | null;
  couponCode:     string | null;   // código del cupón aplicado, si hubo
  total:          number;
  items:          OrderItemResponseDto[];
}
```

### `OrderItemResponseDto`

```typescript
{
  id:          number;
  productId:   number | null;
  productName: string | null;
  comboId:     number | null;
  comboName:   string | null;
  quantity:    number;
  unitPrice:   number;
  finalPrice:  number;
}
```

---

## Endpoints

Todas las rutas tienen prefijo `/v1/` — el controller usa `{ version: '1', path: 'orders' }`.

---

### `POST /v1/orders` — Crear orden

**Auth:** JWT requerido (cualquier rol autenticado)  
**Throttle:** máx 5 requests por minuto por IP  
**Idempotencia:** `IdempotencyInterceptor` activo — si se envía el mismo body dos veces en la misma ventana de tiempo, el segundo request devuelve la respuesta cacheada sin crear una segunda orden (previene duplicados por doble click o retry).

**Request body:**

```json
{
  "items": [
    { "productId": 3, "quantity": 2 },
    { "comboId": 1,   "quantity": 1 }
  ],
  "deliveryType": "delivery",
  "address": "Av. Corrientes 1234, CABA",
  "couponCode": "promo10",
  "notes": "Sin cebolla en la milanesa"
}
```

| Campo | Tipo | Requerido | Reglas |
|---|---|---|---|
| `items` | array | ✅ | mínimo 1 elemento |
| `items[].productId` | number ≥ 1 | uno u otro | mutuamente excluyente con `comboId` |
| `items[].comboId` | number ≥ 1 | uno u otro | mutuamente excluyente con `productId` |
| `items[].quantity` | integer 1–500 | ✅ | entero positivo |
| `deliveryType` | `'delivery'` \| `'pickup'` | ✅ | |
| `address` | string ≤ 500 | solo si `delivery` | requerida cuando `deliveryType === 'delivery'` |
| `couponCode` | string ≤ 100 | ❌ | normalizado a MAYÚSCULAS + trim automáticamente; omitir si no hay cupón |
| `notes` | string ≤ 500 | ❌ | texto libre |

**Response `201`:**

```json
{
  "id": 42,
  "createdAt": "2026-05-30T14:22:00.000Z",
  "updatedAt": "2026-05-30T14:22:00.000Z",
  "userId": 7,
  "status": "pending",
  "deliveryType": "delivery",
  "address": "Av. Corrientes 1234, CABA",
  "notes": "Sin cebolla en la milanesa",
  "subtotal": 4960.80,
  "couponDiscount": 496.08,
  "couponCode": "PROMO10",
  "total": 4464.72,
  "items": [
    {
      "id": 101,
      "productId": 3,
      "productName": "Milanesa napolitana",
      "comboId": null,
      "comboName": null,
      "quantity": 2,
      "unitPrice": 1500.40,
      "finalPrice": 3000.80
    },
    {
      "id": 102,
      "productId": null,
      "productName": null,
      "comboId": 1,
      "comboName": "Combo Familiar",
      "quantity": 1,
      "unitPrice": 1960.00,
      "finalPrice": 1960.00
    }
  ]
}
```

**Errores:**

| Código | Cuándo |
|---|---|
| `400` | Body inválido (campo faltante, tipo incorrecto) |
| `400` | `deliveryType: 'delivery'` sin `address` |
| `400` | Ítem sin `productId` ni `comboId`, o con ambos |
| `400` | Stock insuficiente para algún producto |
| `400` | Cupón expirado, no vigente aún, o agotado |
| `400` | Cupón no aplica a ningún ítem de la orden |
| `404` | Producto o combo no encontrado |
| `404` | Sin stock registrado para algún producto |
| `404` | Cupón no encontrado |
| `409` | El usuario ya utilizó ese cupón |

---

### `GET /v1/orders` — Listar todas las órdenes (admin)

**Auth:** JWT + rol `ADMIN` o `SUPER_ADMIN`

**Query params:**

| Param | Tipo | Default | |
|---|---|---|---|
| `page` | number | 1 | |
| `limit` | number | 20 | |

**Response `200`:**

```json
{
  "data": [ /* Order[] — ver estructura completa en POST 201 */ ],
  "total": 284,
  "page": 1,
  "limit": 20,
  "totalPages": 15,
  "hasNextPage": true
}
```

Ordenadas por `createdAt DESC` (más recientes primero).

---

### `GET /v1/orders/user/:userId` — Órdenes de un usuario

**Auth:** JWT requerido  
**Autorización:**
- `client` — solo puede consultar sus propias órdenes. Si `userId` no coincide con `req.user.sub` → `403`.
- `admin` / `super_admin` — puede ver las de cualquier usuario.

**Response `200`:** `Order[]` — array directo sin paginación, ordenado por `createdAt DESC`.

**Errores:**

| Código | Cuándo |
|---|---|
| `403` | Cliente intentando ver órdenes de otro usuario |

---

### `GET /v1/orders/:id` — Ver una orden por ID

**Auth:** JWT requerido  
**Autorización:**
- `client` — solo puede ver su propia orden. Si `order.userId !== req.user.sub` → `403`.
- `admin` / `super_admin` — puede ver cualquier orden.

**Response `200`:** `Order` con todos los campos (ver estructura en POST 201).

**Errores:**

| Código | Cuándo |
|---|---|
| `403` | Cliente intentando ver orden de otro usuario |
| `404` | Orden no encontrada |

---

### `PATCH /v1/orders/:id/status` — Cambiar estado (admin)

**Auth:** JWT + rol `ADMIN` o `SUPER_ADMIN`

**Request body:**

```json
{ "status": "confirmed" }
```

**Transiciones válidas:**

| Estado actual | Puede ir a | Efecto secundario |
|---|---|---|
| `pending` | `confirmed` | envía email al cliente |
| `pending` | `cancelled` | libera stock reservado + revierte cupón + email |
| `confirmed` | `dispatched` | descuenta stock físico + email |
| `confirmed` | `cancelled` | libera stock reservado + revierte cupón + email |
| `dispatched` | `delivered` | email al cliente |
| `delivered` | — | terminal, sin acciones |
| `cancelled` | — | terminal, sin acciones |

**Response `200`:** `Order` actualizada.

**Errores:**

| Código | Cuándo |
|---|---|
| `400` | Transición inválida (ej: `delivered → pending`) |
| `400` | Valor de `status` no reconocido |
| `404` | Orden no encontrada |

---

## Integración para el panel admin

### Mostrar el listado de órdenes

- Usar `GET /v1/orders?page=1&limit=20` con paginación.
- Los precios (`unitPrice`, `finalPrice`, `subtotal`, `couponDiscount`, `total`) son **snapshot** del momento de la compra — no cambian si el precio del producto se modifica después. Mostrarlos directamente sin recalcular.
- `couponCode` y `couponDiscount` son `null` si no se usó cupón — condicionar el render de la sección de descuento.
- `address` es `null` si `deliveryType === 'pickup'` — condicionar el render del campo de dirección.

### Botones de acción por estado

Habilitar solo las transiciones válidas según el estado actual:

```
pending    → [Confirmar, Cancelar]
confirmed  → [Despachar, Cancelar]
dispatched → [Marcar entregado]
delivered  → sin acciones (readonly)
cancelled  → sin acciones (readonly)
```

Usar `PATCH /v1/orders/:id/status` con el valor correspondiente.

> **Importante:** pasar a `dispatched` descuenta stock físico — es irreversible hacia atrás. Solo habilitarlo cuando el admin confirme físicamente el despacho.

### Emails automáticos al cliente

El servidor los envía automáticamente al cambiar el estado — el frontend no hace nada extra:

| Transición | Email enviado |
|---|---|
| `→ confirmed` | Confirmación de pedido |
| `→ dispatched` | Pedido en camino |
| `→ cancelled` | Pedido cancelado |
| `→ delivered` | Pedido entregado |

### Historial de un cliente

Para ver todas las órdenes de un usuario específico desde el panel admin:
```
GET /v1/orders/user/:userId
```
Devuelve un array directo (sin paginación) ordenado por fecha descendente.

---

## Reglas de negocio

| Regla | Implementación |
|---|---|
| Stock reservado al crear la orden | `StockItemsService.reserveStock()` dentro de la transacción |
| Stock descontado al despachar | `StockItemsService.dispatchStock()` en `handleDispatch` |
| Stock liberado al cancelar | `StockItemsService.releaseReservation()` en `handleCancellation` |
| Cupón con lock pesimista | `manager.findOne(CouponEntity, { lock: 'pessimistic_write' })` evita TOCTOU |
| Cupón revertido al cancelar | `usageCount - 1` + `softDelete` del `CouponUsageEntity` |
| Snapshot de precios | `unitPrice` y `finalPrice` guardados al crear — no cambian si cambia el pricing |
| Stock elegido por disponibilidad | La ubicación con mayor `quantityAvailable` para el producto |
| Precios calculados por `CalculationService` | Separación de responsabilidades — orders no calcula, solo llama |
| Lock en updateStatus (dos queries) | Lock-only primero (sin relaciones), luego carga con relaciones — evita error PostgreSQL "FOR UPDATE on nullable outer join" |
| Throttle en creación | 5 req / 60s por usuario para prevenir abuse |

---

## Flujo interno de `create`

```
1. Validar que el usuario existe
2. Validar que cada item tiene productId XOR comboId
3. Validar que si deliveryType = DELIVERY, hay address
4. Por cada item:
   a. Cargar producto o combo
   b. Encontrar stock disponible (mejor ubicación)
   c. Calcular precio con CalculationService
   d. Construir OrderItemEntity (snapshot de precios + locationId/comboReservations)
5. Calcular descuento del cupón (si hay)
6. Iniciar transacción:
   a. Lock pesimista sobre el cupón
   b. Validar cupón (fechas, límite, uso previo del usuario)
   c. Guardar OrderEntity + OrderItemEntity (cascade)
   d. Reservar stock para cada item (atómico)
   e. Registrar CouponUsageEntity + incrementar usageCount
7. Retornar OrderResponseDto
```

---

## Dependencias del módulo

| Dependencia | Uso |
|---|---|
| `StockItemsService` | Reservar, despachar y liberar stock |
| `CalculationService` | Calcular `unitPrice` y `finalPrice` por producto/combo |
| `DataSource` | Transacciones con `dataSource.transaction()` |
| `CouponEntity` | Validación y lock pesimista del cupón |
| `CouponUsageEntity` | Registro de uso por usuario/orden |
| `ProductEntity` / `ComboEntity` | Validar existencia y cargar datos del item |
| `UserEntity` | Validar existencia del comprador |

---

## Conformidad con estándares

### nestjs-core

| Regla | Estado |
|---|---|
| Guards a nivel clase con `@UseGuards(AuthGuard('jwt'))` | ✅ |
| `@Roles()` + `RolesGuard` para endpoints de admin | ✅ GET /v1/orders y PATCH /:id/status |
| URI versioning `/v1/` en el controller | ✅ `@Controller({ version: '1', path: 'orders' })` |
| Rutas específicas antes de genéricas | ✅ `GET /user/:userId` está antes de `GET /:id` |
| `ValidationPipe` con `whitelist`, `forbidNonWhitelisted`, `transform` | ✅ (global, configurado en main.ts) |
| `@ApiTags`, `@ApiBearerAuth` a nivel clase | ✅ |
| `@ApiResponse` con `type: OrderResponseDto` en todos los endpoints | ✅ |
| `@ApiProperty` en todos los campos de DTOs | ✅ |
| Throttle en endpoints de creación sensibles | ✅ 5/60s en POST /v1/orders |
| Mensajes de error en español | ✅ |
| `couponCode` normalizado a mayúsculas + trim | ✅ `@Transform` en `CreateOrderDto` |

### typeorm-standard

| Regla | Estado |
|---|---|
| `@Column` explícito para cada FK junto al `@ManyToOne` | ✅ `userId`, `couponId`, `orderId`, `productId`, `comboId` |
| `onDelete: 'RESTRICT'` en relaciones ManyToOne | ✅ Todas excepto `order → items` (CASCADE) |
| Soft delete con `isDeleted = true` (BaseEntity) | ✅ |
| Transacciones con `dataSource.transaction()` | ✅ en `create` y `updateStatus` |
| Lock pesimista para concurrencia | ✅ cupón en `create`, orden en `updateStatus` |
| Columnas `decimal` con `transformer` para convertir a `Number` | ✅ `subtotal`, `couponDiscount`, `total` |

---

## Tests

### Unitarios (`orders.service.spec.ts`, `orders.controller.spec.ts`)

- **41 tests** — `OrdersService` + `OrdersController`
- Repositorios mockeados con `jest.fn()`; `couponRepo` y `couponProductTargetRepo` extraídos para tests de cupón
- Factory `mockOrder(overrides)` para datos de prueba
- Cubren: create (con/sin cupón, stock insuficiente, producto no encontrado, cupón no encontrado, cupón expirado, cupón agotado, cupón no aplica a ítems, cupón ya usado, con combo), findAll (paginado, vacío), findOne (200, 404), findByUser (200), updateStatus (confirmar, despachar producto, despachar combo, cancelar producto, cancelar combo, transición inválida desde DELIVERED, transición inválida desde CANCELLED, 404), releaseStockForOrder (5 casos)

### E2E (`test/orders/orders.e2e-spec.ts`)

- **23 tests** — PostgreSQL real (puerto 5433), schema sincronizado y destruido en cada suite
- `CalculationService` mockeado (precios fijos: `unitPrice=1000`, `finalPrice=1000`)
- `StockItemsService` real — valida la integración de reservas y despacho
- JWT override con `mockUser` mutable para simular cambio de rol/usuario
- Seed completo: perfil → usuario → categoría → producto → ubicación de stock → stock (50 unidades)
- Cubren: POST (201 pickup, 201 delivery + dirección, 201 con notes, 400 items vacíos, 400 delivery sin dirección, 400 sin productId/comboId, 404 producto inexistente, 400 stock insuficiente), GET /v1/orders (paginado, limit=1), GET /v1/orders/user/:id (200 + 403 cliente), GET /v1/orders/:id (200 + 404 + 403 cliente), PATCH /:id/status (PENDING→CONFIRMED, CONFIRMED→PENDING inválido, CONFIRMED→CANCELLED, CANCELLED→CONFIRMED inválido, camino completo PENDING→CONFIRMED→DISPATCHED→DELIVERED, DELIVERED→CANCELLED inválido, status inválido, 404)
