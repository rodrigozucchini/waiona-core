# Stocks — Análisis Técnico Completo

## ¿Qué es el módulo de stocks?

El módulo de stocks gestiona el inventario físico de productos en la plataforma. Se compone de cuatro sub-módulos:

- **StockLocations** — depósitos, sucursales y cualquier ubicación física donde se almacenan productos.
- **StockItems** — unidad de inventario que representa un producto en una ubicación concreta. Lleva los contadores de stock (`quantityCurrent`, `quantityReserved`) y los umbrales de alerta (`stockMin`, `stockCritical`, `stockMax`).
- **StockMovements** — log inmutable de cada operación que modificó el stock (entrada, salida, ajuste, despacho, etc.).
- **StockWriteOffs** — registro de bajas por daño, vencimiento u otras causas, siempre ligadas a un movimiento.

El módulo se ubica entre el catálogo de productos y el motor de órdenes. El `OrdersModule` consume `StockItemsService.reserveStock()`, `dispatchStock()` y `releaseReservation()`. El `ShopModule` consume `findByProduct()` y `findByCombo()` para mostrar disponibilidad al cliente.

```
Orden creada   → reserveStock()      → quantityReserved += N   (stock reservado, no descontado aún)
Admin despacha → dispatchStock()     → quantityCurrent  -= N   (descuento real)
                                     → quantityReserved -= N
Admin cancela  → releaseReservation()→ quantityReserved -= N   (libera reserva)

quantityAvailable = quantityCurrent - quantityReserved   (calculado como getter, no persiste)
```

---

## Cuándo se usa en el negocio

| Escenario | Ejemplo |
|---|---|
| Alta de inventario en nueva ubicación | Admin crea un StockItem para el producto "Notebook X1" en "Depósito Norte" |
| Carga de mercadería | Admin llama `POST /stock-items/add-stock` con 50 unidades recibidas |
| Cliente hace un pedido | Sistema reserva stock con `reserveStock()` al crear la orden |
| Admin despacha la orden | Sistema descuenta stock real con `dispatchStock()` al pasar a DISPATCHED |
| Admin cancela la orden | Sistema libera la reserva con `releaseReservation()` al pasar a CANCELLED |
| Baja por daño | Admin registra con `POST /stock-items/write-off-damage` y crea el write-off |
| Consulta de stock en el shop | `findByProduct()` devuelve la ubicación con mayor stock disponible |
| Consulta de stock de combo | `findByCombo()` calcula cuántos combos se pueden armar con el stock de sus componentes |

---

## Tipos de datos

### Entidad `StockLocationEntity`

```typescript
{
  id:        number;             // PK autoincremental — tabla 'stock_locations'
  name:      string;             // varchar(120), not null — índice en 'name'
  type:      StockLocationType;  // enum: 'WAREHOUSE' | 'STORE'
  address?:  string | null;      // varchar(255), nullable — null si no aplica
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;        // soft delete via @DeleteDateColumn
}
```

### Entidad `StockItemEntity`

```typescript
{
  id:                number;              // PK autoincremental — tabla 'stock_items'
  productId:         number;              // FK → products; unique compuesto (productId, locationId)
  locationId:        number;              // FK → stock_locations
  quantityCurrent:   number;             // int — stock físico total
  quantityReserved:  number;             // int — reservado por órdenes pendientes
  quantityAvailable: number;             // getter: quantityCurrent - quantityReserved (no persiste)
  stockMin:          number;             // umbral mínimo de alerta
  stockCritical:     number;             // umbral crítico (debe ser < stockMin)
  stockMax?:         number | null;      // umbral máximo opcional (debe ser > stockMin)
  movements:         StockMovementEntity[]; // OneToMany — historial de movimientos
  createdAt:         Date;
  updatedAt:         Date;
  deletedAt:         Date | null;
}
```

### Entidad `StockMovementEntity`

```typescript
{
  id:            number;               // PK — tabla 'stock_movements'; no tiene soft delete (@BaseAuditEntity)
  stockItemId:   number;               // FK → stock_items
  operationType: StockOperationType;   // ENTRY | EXIT | ADJUSTMENT | DAMAGE | RETURN | INITIAL
  stockFlow:     StockFlow;            // INBOUND | OUTBOUND
  quantity:      number;               // int, siempre positivo
  referenceType: StockReferenceType;   // ORDER | PURCHASE_ORDER | ADJUSTMENT | DAMAGE_REPORT | MANUAL
  referenceId?:  number | null;        // ID de la orden u otro objeto; null si es MANUAL
  createdAt:     Date;
}
```

### Entidad `StockWriteOffEntity`

```typescript
{
  id:          number;               // PK — tabla 'stock_write_offs'
  stockItemId: number;               // FK → stock_items
  movementId:  number;               // FK → stock_movements (siempre un movimiento DAMAGE)
  quantity:    number;               // int, >= 1
  reason:      StockWriteOffReason;  // DAMAGED | EXPIRED | DEFECTIVE | CONTAMINATED | LOST | INVENTORY_ERROR | OTHER
  description?: string | null;       // text, opcional
  attachments?: string[] | null;     // jsonb — array de URLs de imágenes/documentos
  reportedBy:  number;               // ID del usuario que registró la baja
  createdAt:   Date;
  updatedAt:   Date;
  deletedAt:   Date | null;
}
```

---

### Request: crear ubicación (`CreateStockLocationDto`)

```typescript
{
  name:      string;             // requerido, 3–120 caracteres
  type:      StockLocationType;  // requerido, 'WAREHOUSE' | 'STORE'
  address?:  string;             // opcional, máx 255 caracteres
}
```

### Request: actualizar ubicación (`UpdateStockLocationDto`)

Todos los campos son opcionales. `address` acepta `null` para limpiar el campo.

> `UpdateStockLocationDto` no extiende `PartialType(CreateStockLocationDto)` porque `address?: string | null` amplía el tipo base y TypeScript lo rechaza. Se declara manualmente con `@ValidateIf(o => o.address !== null)`.

```typescript
{
  name?:    string;              // opcional, 3–120 caracteres
  type?:    StockLocationType;   // opcional
  address?: string | null;       // opcional — null limpia la dirección
}
```

### Request: crear stock item (`CreateStockItemDto`)

```typescript
{
  productId:     number;   // requerido, >= 1
  locationId:    number;   // requerido, >= 1
  stockMin:      number;   // requerido, >= 0
  stockCritical: number;   // requerido, >= 0, debe ser < stockMin
  stockMax?:     number;   // opcional, debe ser > stockMin si se envía
}
```

### Request: actualizar umbrales (`UpdateStockThresholdsDto`)

```typescript
{
  stockMin?:      number;  // opcional, >= 0
  stockCritical?: number;  // opcional, >= 0, debe ser < stockMin efectivo
  stockMax?:      number;  // opcional, >= 0, debe ser > stockMin efectivo
}
```

### Request: agregar stock (`StockItemAddStockDto`)

```typescript
{
  productId:  number;  // requerido, >= 1
  locationId: number;  // requerido, >= 1
  quantity:   number;  // requerido, >= 1
}
```

### Request: baja simple (`StockItemWriteOffDto`)

```typescript
{
  stockItemId: number;  // requerido, >= 1
  quantity:    number;  // requerido, >= 1
}
```

### Request: baja por daño (`CreateStockWriteOffDto`)

```typescript
{
  stockItemId:  number;               // requerido, >= 1
  quantity:     number;               // requerido, >= 1
  reason:       StockWriteOffReason;  // requerido
  description?: string;               // opcional, máx 500 caracteres
  attachments?: string[];             // opcional, array de URLs
  reportedBy:   number;               // requerido, ID del usuario
}
```

### Request: despacho/liberación (`StockDispatchDto` / `StockReleaseDto`)

```typescript
{
  productId:  number;  // requerido, >= 1
  locationId: number;  // requerido, >= 1
  quantity:   number;  // requerido, >= 1
  orderId:    number;  // requerido — ID de la orden
}
```

### Response: ubicación (`StockLocationResponseDto`)

```typescript
{
  id:        number;
  name:      string;
  type:      StockLocationType;
  address?:  string;             // undefined si no tiene dirección (null de DB → undefined en DTO)
  createdAt: Date;
  updatedAt: Date;
}
```

### Response: stock item (`StockItemResponseDto`)

```typescript
{
  id:                number;
  productId:         number;
  locationId:        number;
  locationName:      string;   // nombre de la ubicación — cargado por relación
  quantityCurrent:   number;
  quantityReserved:  number;
  quantityAvailable: number;   // calculado al mapear: quantityCurrent - quantityReserved
  stockMin:          number;
  stockCritical:     number;
  stockMax?:         number;   // undefined si null en DB
  createdAt:         Date;
  updatedAt:         Date;
}
```

### Response: stock item con movimientos (`StockItemWithMovementsResponseDto`)

Igual a `StockItemResponseDto` más:

```typescript
{
  movements: StockMovementResponseDto[];  // historial ordenado por createdAt DESC
}
```

### Response: movimiento (`StockMovementResponseDto`)

```typescript
{
  id:            number;
  stockItemId:   number;
  operationType: StockOperationType;
  stockFlow:     StockFlow;
  quantity:      number;
  referenceType: StockReferenceType;
  referenceId?:  number;   // undefined si MANUAL
  createdAt:     Date;
}
```

### Response: write-off (`StockWriteOffResponseDto`)

```typescript
{
  id:           number;
  stockItemId:  number;
  movementId:   number;
  quantity:     number;
  reason:       StockWriteOffReason;
  description?: string;
  attachments?: string[];
  reportedBy:   number;
  createdAt:    Date;
  updatedAt:    Date;
}
```

### Response: listado paginado

```typescript
{
  data:  T[];     // StockLocationResponseDto | StockItemResponseDto | StockMovementResponseDto | StockWriteOffResponseDto
  total: number;
  page:  number;
  limit: number;
}
```

---

## Endpoints

### `POST /stock-locations` — Crear ubicación

| Campo | Valor |
|---|---|
| Auth | JWT + ADMIN o SUPER_ADMIN |
| Body | `CreateStockLocationDto` |
| Respuesta | `201 StockLocationResponseDto` |

**Request:**
```json
{ "name": "Depósito Central", "type": "WAREHOUSE" }
```

**Response:**
```json
{ "id": 1, "name": "Depósito Central", "type": "WAREHOUSE", "createdAt": "...", "updatedAt": "..." }
```

**Errores posibles:**
- `400` — falta `name` o `type`, nombre muy corto (< 3), tipo inválido

---

### `GET /stock-locations` — Listar ubicaciones

| Campo | Valor |
|---|---|
| Auth | JWT + ADMIN o SUPER_ADMIN |
| Query | `page` (default 1), `limit` (default 20) |
| Respuesta | `200 PaginatedResponseDto<StockLocationResponseDto>` |

---

### `GET /stock-locations/:id` — Obtener ubicación

| Campo | Valor |
|---|---|
| Respuesta | `200 StockLocationResponseDto` |

**Errores:** `404` — no encontrada o soft-deleted

---

### `PATCH /stock-locations/:id` — Actualizar ubicación

Todos los campos del body son opcionales. Enviar `address: null` limpia la dirección.

**Errores:** `400` — validación, `404` — no encontrada

---

### `DELETE /stock-locations/:id` — Eliminar ubicación (soft)

| Respuesta | `204 No Content` |
|---|---|
| **Errores** | `404` — no encontrada |

---

### `POST /stock-items` — Crear stock item

| Campo | Valor |
|---|---|
| Auth | JWT + ADMIN o SUPER_ADMIN |
| Body | `CreateStockItemDto` |
| Respuesta | `201 StockItemResponseDto` (quantityCurrent = 0) |

**Request:**
```json
{ "productId": 1, "locationId": 1, "stockMin": 5, "stockCritical": 2, "stockMax": 100 }
```

**Errores posibles:**
- `400` — `stockCritical >= stockMin`, `stockMax <= stockMin`, valores negativos
- `409` — ya existe un StockItem para ese `productId + locationId`

---

### `GET /stock-items` — Listar stock items

| Query | `page`, `limit` |
|---|---|
| Respuesta | `200 PaginatedResponseDto<StockItemResponseDto>` |

Carga las relaciones `location` y `product` para incluir `locationName`.

---

### `GET /stock-items/:id` — Obtener stock item con movimientos

| Respuesta | `200 StockItemWithMovementsResponseDto` |
|---|---|
| **Errores** | `404` — no encontrado |

Carga `location`, `product` y `movements` (ordenados por `createdAt DESC`).

---

### `POST /stock-items/add-stock` — Agregar stock

Crea un movimiento `ENTRY / INBOUND / MANUAL` y suma `quantity` a `quantityCurrent`. Usa transacción con lock `pessimistic_write`.

**Request:**
```json
{ "productId": 1, "locationId": 1, "quantity": 50 }
```

**Response:** `201 StockItemWithMovementsResponseDto`

**Errores:** `400` — quantity <= 0, `404` — StockItem no existe

---

### `POST /stock-items/write-off` — Baja simple

Resta `quantity` de `quantityCurrent`. Crea movimiento `ADJUSTMENT / OUTBOUND / MANUAL`. Requiere que `quantityAvailable >= quantity`.

**Errores:** `400` — stock insuficiente o quantity inválida, `404` — no encontrado

---

### `POST /stock-items/write-off-damage` — Baja por daño

Igual que write-off simple pero además crea un registro en `StockWriteOffEntity` con motivo, descripción y adjuntos. Crea movimiento `DAMAGE / OUTBOUND / MANUAL`.

**Request:**
```json
{
  "stockItemId": 1, "quantity": 3,
  "reason": "DAMAGED", "description": "Cajas rotas en tránsito",
  "attachments": ["https://cdn.ejemplo.com/foto.jpg"], "reportedBy": 99
}
```

**Errores:** `400` — stock insuficiente, `404` — no encontrado

---

### `POST /stock-items/dispatch` — Despachar stock (interno — usado por OrdersModule)

Descuenta `quantityCurrent` y `quantityReserved`. Crea movimiento `EXIT / OUTBOUND / ORDER`. Requiere que `quantityReserved >= quantity` y `quantityCurrent >= quantity`.

**Errores:** `400` — reserva o stock insuficiente, `404` — no encontrado

---

### `POST /stock-items/release` — Liberar reserva (interno — usado por OrdersModule)

Resta `quantityReserved` sin tocar `quantityCurrent`. Crea movimiento `RETURN / INBOUND / ORDER`.

**Errores:** `400` — reserva insuficiente, `404` — no encontrado

---

### `PATCH /stock-items/:id/thresholds` — Actualizar umbrales

Todos los campos son opcionales. Valida reglas de umbrales sobre los valores resultantes (actuales + enviados).

**Errores:** `400` — reglas de umbrales violadas, `404` — no encontrado

---

### `GET /stock-movements` — Listar movimientos

| Respuesta | `200 PaginatedResponseDto<StockMovementResponseDto>` |
|---|---|

---

### `GET /stock-movements/stock-item/:stockItemId` — Movimientos de un item

| Respuesta | `200 StockMovementResponseDto[]` |
|---|---|

---

### `GET /stock-movements/:id` — Obtener movimiento

| Respuesta | `200 StockMovementResponseDto` |
|---|---|
| **Errores** | `404` — no encontrado |

---

### `GET /stock-write-offs` — Listar write-offs

| Respuesta | `200 PaginatedResponseDto<StockWriteOffResponseDto>` |
|---|---|

---

### `GET /stock-write-offs/stock-item/:stockItemId` — Write-offs de un item

| Respuesta | `200 StockWriteOffResponseDto[]` |
|---|---|

---

### `GET /stock-write-offs/:id` — Obtener write-off

| Respuesta | `200 StockWriteOffResponseDto` |
|---|---|
| **Errores** | `404` — no encontrado |

---

### `PATCH /stock-write-offs/:id` — Actualizar write-off

Solo permite modificar `reason`, `description` y `attachments`. No se puede cambiar `quantity`, `stockItemId` ni `movementId`.

**Errores:** `404` — no encontrado

---

## Reglas de negocio

| Regla | Dónde se aplica |
|---|---|
| `stockCritical < stockMin` siempre | `validateThresholds()` en service — create y update thresholds |
| `stockMax > stockMin` si se define | `validateThresholds()` en service |
| Un producto puede tener stock en múltiples ubicaciones | Unique index compuesto `(productId, locationId)` — un StockItem por combinación |
| `reserveStock` no descuenta stock físico | Suma a `quantityReserved`; el descuento real ocurre en `dispatchStock` |
| `dispatchStock` requiere reserva previa | Valida `quantityReserved >= quantity` antes de descontar |
| `findByProduct` elige la ubicación con mayor `quantityAvailable` | No mezcla stock de múltiples ubicaciones |
| `findByCombo` usa `floor(min(disponible / cantidad requerida))` | Calcula cuántos combos completos se pueden armar |
| Write-off simple vs daño | Write-off simple = ajuste MANUAL; write-off daño = crea registro en `stock_write_offs` |
| Los movimientos no tienen soft delete | Usan `BaseAuditEntity` sin `deletedAt` — son inmutables por diseño |
| `address: null` limpia la dirección en PATCH | `ValidateIf(o => o.address !== null)` permite el valor explícito sin que `@IsString` falle |

---

## Ejemplos de uso real

**Alta de mercadería en depósito:**
```json
// POST /stock-items/add-stock
{ "productId": 5, "locationId": 2, "quantity": 200 }
// → 201 StockItemWithMovementsResponseDto con movimiento ENTRY
```

**Despacho de una orden (llamado interno desde OrdersModule):**
```json
// POST /stock-items/dispatch
{ "productId": 5, "locationId": 2, "quantity": 3, "orderId": 88 }
```

**Baja por vencimiento:**
```json
// POST /stock-items/write-off-damage
{
  "stockItemId": 7, "quantity": 12, "reason": "EXPIRED",
  "description": "Lote vencido 2026-04", "reportedBy": 3
}
```

**Ajustar umbral de alerta:**
```json
// PATCH /stock-items/4/thresholds
{ "stockMin": 20, "stockCritical": 5, "stockMax": 500 }
```

---

## Cumplimiento con agent skills

| Convención | Estado | Detalle |
|---|---|---|
| Guards a nivel de clase (controller) | ✅ | `@Roles` + `@UseGuards(AuthGuard('jwt'), RolesGuard)` en todos los controllers |
| Rutas específicas antes de genéricas | ✅ | `add-stock`, `write-off`, `dispatch`, `release` declaradas antes de `:id` |
| Services devuelven DTOs, nunca entidades | ✅ | Todos los métodos públicos retornan ResponseDto |
| `findEntity()` privado reutilizable | ✅ | Presente en StockLocationsService y StockItemsService |
| Transacciones con `dataSource.transaction()` | ✅ | `addStock`, `writeOff`, `writeOffDamage`, `dispatchStock`, `releaseReservation` |
| Lock `pessimistic_write` en operaciones críticas | ✅ | Todas las operaciones de conteo de stock |
| Soft delete con `softDelete()` | ✅ | StockLocations; movimientos usan BaseAuditEntity sin soft delete (inmutables) |
| `@ApiProperty` en todos los DTOs | ✅ | Todos los DTOs tienen decoradores Swagger |
| `PartialType` / `PickType` para updates | ✅ | UpdateStockWriteOffDto usa `PartialType(PickType(...))` |
| `UpdateStockLocationDto` manual (excepción documentada) | ✅ | `address?: string \| null` no es asignable al tipo base — comentario en el DTO |
| `PG_UNIQUE_VIOLATION` en ConflictException | ✅ | Usado en `create()` de StockItemsService |

---

## Tests

### Unit tests

```bash
npx jest --testPathPattern="stocks"
```

| Suite | Tests | Qué cubre |
|---|---|---|
| `stock-item.service.spec.ts` | 32 | create, addStock, writeOff, writeOffDamage, updateThresholds, reserveStock, dispatchStock, releaseReservation, findByProduct, findByCombo, validaciones de umbrales, race condition con lock pessimistic |
| `stock-item.controller.spec.ts` | 9 | Delegación de todos los endpoints al service |
| `stock-locations.service.spec.ts` | 9 | CRUD completo, soft delete, null en address |
| `stock-locations.controller.spec.ts` | 5 | Delegación de los 5 endpoints |
| `stock-movement.service.spec.ts` | 5 | findAll, findByStockItemId, findById, 404 |
| `stock-movement.controller.spec.ts` | 3 | Delegación de los 3 endpoints |
| `stock-writeoff.service.spec.ts` | 7 | findAll, findByStockItemId, findById, update, 404 |
| `stock-writeoff.controller.spec.ts` | 4 | Delegación de los 4 endpoints |

### E2E tests

```bash
npx jest --config test/jest-e2e.json --testPathPattern="stocks"
```

> Los suites e2e usan `maxWorkers: 1` en `jest-e2e.json` para evitar que sus `dropSchema: true` se pisen entre sí.

| Suite | Tests | Caso cubierto |
|---|---|---|
| `stock-locations.e2e-spec.ts` | 14 | POST 201, POST 400 (missing name, invalid type, name corto), GET all, GET :id 200, GET :id 404, PATCH name, PATCH null address, PATCH 404, DELETE 204→404, DELETE 404 |
| `stock-items.e2e-spec.ts` | 19 | POST 201, POST 409, POST 400 thresholds, GET all, GET :id, GET :id 404, add-stock 201, add-stock 400, add-stock 404, write-off 201, write-off 400, thresholds 200, thresholds 400, thresholds 404, movements GET all, movements GET by item, movements GET :id, movements GET :id 404 |

> **Nota:** `dispatchStock`, `releaseReservation` y `writeOffDamage` están cubiertos únicamente en unit tests porque dependen de flujo de órdenes completo y se invocan internamente desde `OrdersModule`.

---

## Integración con otros módulos

```
ProductsModule
  └── ProductEntity ──────────────────────────────┐
                                                   ▼
                                          StockItemsModule
                                          ├── StockLocationsModule
                                          ├── StockMovementsModule
                                          └── StockWriteOffsModule
                                                   │
                          ┌────────────────────────┼────────────────────────┐
                          ▼                         ▼                        ▼
                   OrdersModule              ShopModule              (futuro: alertas)
                   reserveStock()          findByProduct()
                   dispatchStock()         findByCombo()
                   releaseReservation()
```
