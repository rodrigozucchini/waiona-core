# Pricing — Análisis Técnico Completo

## ¿Qué es el módulo de pricing?

El módulo de pricing centraliza la configuración de precios y el motor de cálculo de la plataforma. Se compone de tres sub-módulos:

- **ProductPricing** — almacena el precio base (`unitPrice`), moneda y margen opcional de cada producto.
- **ComboPricing** — ídem para combos.
- **Calculation** — motor de cálculo que combina pricing, margen, descuentos vigentes e impuestos para producir el desglose completo del precio final.

El módulo se ubica entre el catálogo (productos/combos) y el motor de órdenes. Tanto el shop como el proceso de creación de órdenes lo consumen para conocer el precio real en tiempo de ejecución.

```
unitPrice
  → descuento activo (%, por fechas)   → priceAfterDiscount
  → margen (%, del pricing)             → priceAfterMargin
  → impuestos específicos + globales (%)→ finalPrice      ← precio con descuento
  → cupón (%, nivel orden)              → orderTotal       ← lo que paga el cliente

fullPrice = unitPrice + margen(sobre unitPrice) + impuestos(sobre eso)  ← precio tachado del front
```

Todos los valores — descuento, margen, impuestos y cupón — son **siempre porcentuales**.

---

## Cuándo se usa en el negocio

| Escenario | Ejemplo |
|---|---|
| Alta de producto nuevo | Se crea `ProductPricing` con unitPrice y moneda al cargar un producto al catálogo |
| Asignar margen de ganancia | Admin vincula un margen `20%` al pricing de un producto |
| Quitar el margen | Admin envía `marginId: null` en el update para desvincular el margen |
| Shop mostrando precio | `POST /v1/pricing/calculate/product` retorna `finalPrice` y `fullPrice` para mostrar precio actual y tachado |
| Probar combinaciones antes de publicar | Admin usa `POST /v1/pricing/calculate/preview` con valores manuales sin tocar datos reales |
| Actualizar precio base | `PATCH /v1/product-pricing/:id` con el nuevo `unitPrice` |

---

## Tipos de datos

### Entidad `ProductPricingEntity`

```typescript
{
  id:        number;              // PK autoincremental — tabla 'product_pricing'
  productId: number;              // FK → products; unique index (1 pricing por producto)
  currency:  CurrencyCode;        // enum: 'ARS' | 'USD' | ...
  unitPrice: number;              // decimal(12,2) — viene como string de PG, convertido en DTO
  margin?:   MarginEntity | null; // relación opcional — null si no hay margen asignado
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;         // soft delete via @DeleteDateColumn
}
```

### Entidad `ComboPricingEntity`

Estructura idéntica a `ProductPricingEntity`, con `comboId` en lugar de `productId`. Tabla `combo_pricing`, unique index en `comboId`.

---

### Request: crear product pricing (`CreateProductPricingDto`)

```typescript
{
  productId: number;   // requerido, entero >= 1
  currency:  string;   // requerido, valor de CurrencyCode enum
  unitPrice: number;   // requerido, >= 0, máx 2 decimales
  marginId?: number;   // opcional, entero >= 1 — null o ausente = sin margen
}
```

### Request: crear combo pricing (`CreateComboPricingDto`)

```typescript
{
  comboId:   number;   // requerido, entero >= 1
  currency:  string;   // requerido, valor de CurrencyCode enum
  unitPrice: number;   // requerido, >= 0, máx 2 decimales
  marginId?: number;   // opcional
}
```

### Request: actualizar (`UpdateProductPricingDto` / `UpdateComboPricingDto`)

Todos los campos son opcionales. `productId` / `comboId` están excluidos (no se puede reasignar el pricing a otro producto/combo).

```typescript
{
  currency?:  string;        // opcional
  unitPrice?: number;        // opcional
  marginId?:  number | null; // null desvincula el margen; ausente = no modifica
}
```

> `marginId: null` está validado con `@ValidateIf(o => o.marginId !== null)` para permitir el valor explícito sin que `@IsInt` falle.

### Response (`ProductPricingResponseDto` / `ComboPricingResponseDto`)

```typescript
{
  id:        number;          // PK
  productId: number;          // (o comboId)
  currency:  CurrencyCode;
  unitPrice: number;          // decimal de PG convertido con Number() — evita string en JSON
  marginId:  number | null;   // null si no tiene margen asignado
  createdAt: Date;
  updatedAt: Date;
}
```

### Response: listado paginado

```typescript
{
  data:        ProductPricingResponseDto[];  // (o ComboPricingResponseDto[])
  total:       number;
  page:        number;
  limit:       number;
  totalPages:  number;
  hasNextPage: boolean;
}
```

---

### Request: calcular precio real (`CalculateProductDto` / `CalculateComboDto`)

```typescript
// producto
{ productId: number; }  // entero >= 1

// combo
{ comboId: number; }    // entero >= 1
```

### Request: preview sin DB (`CalculatePreviewDto`)

Todos los valores son porcentuales. Todos los campos excepto `unitPrice` son opcionales.

```typescript
{
  unitPrice:      number;              // requerido
  discountValue?: number;              // % de descuento — 0.01 a 100
  marginValue?:   number;              // % de margen — 0.01 a 1000
  taxes?:         { value: number }[]; // array de impuestos en % (0.01–100 c/u)
  couponValue?:   number;              // % del cupón sobre finalPrice — 0 a 100
}
```

> Todos los campos son porcentuales. No existe `isPercentage`, `discountIsPercentage`, `marginIsPercentage` ni `couponIsPercentage` — todos se aplican como porcentaje de forma hardcodeada.

### Response: desglose de precio (`PriceBreakdownDto`)

```typescript
{
  unitPrice:          number;  // precio base
  discount:           number;  // monto descontado
  priceAfterDiscount: number;  // unitPrice - discount
  margin:             number;  // monto del margen aplicado
  priceAfterMargin:   number;  // priceAfterDiscount + margin
  taxes:              number;  // suma de todos los impuestos
  finalPrice:         number;  // precio real CON descuento — lo que paga el cliente
  fullPrice:          number;  // precio SIN descuento — para mostrar tachado en el front
  coupon:             number;  // descuento del cupón (0 en calculateProduct/Combo)
  orderTotal:         number;  // finalPrice - coupon
}
```

> Todos los valores son redondeados a 2 decimales con `Math.round(n * 100) / 100`.

---

## Endpoints

### `POST /v1/product-pricing` — Crear pricing de producto

**Errores:**
- `409` — El producto ya tiene pricing (check previo + manejo de `PG_UNIQUE_VIOLATION 23505` para race condition)
- `400` — Datos inválidos (validación de DTO)
- `404` — El `marginId` no existe

---

### `GET /product-pricing` — Listar pricings de productos (paginado)

Query params: `page` (default 1), `limit` (default 20).

---

### `GET /product-pricing/product/:productId` — Obtener pricing por producto

Ruta específica declarada **antes** de `GET /:id` para evitar conflicto de rutas.

**Errores:** `404` — No hay pricing para ese producto.

---

### `GET /product-pricing/:id` — Obtener pricing por ID

**Errores:** `404` — No encontrado.

---

### `PATCH /v1/product-pricing/:id` — Actualizar pricing (parcial)

**Request (desvincula margen):**
```json
{ "marginId": null }
```

**Errores:** `404` — Pricing o margen no encontrado.

---

### `DELETE /product-pricing/:id` — Eliminar pricing (soft delete)

**Response 204.** **Errores:** `404` — No encontrado.

---

### Endpoints de `combo-pricing`

Mismos endpoints, misma lógica, mismos códigos de error. Rutas: `/combo-pricing`, `/combo-pricing/combo/:comboId`, `/combo-pricing/:id`.

---

### `POST /v1/pricing/calculate/preview` — Preview sin DB

Requiere: `SUPER_ADMIN` o `ADMIN`. Calcula el desglose completo con valores manuales sin consultar la base de datos.

**Request:**
```json
{
  "unitPrice":     500,
  "discountValue": 10,
  "marginValue":   20,
  "taxes":         [{ "value": 21 }],
  "couponValue":   15
}
```

**Response 200:** `PriceBreakdownDto`

---

### `POST /v1/pricing/calculate/product` — Calcular precio real de producto

**Público** — sin autenticación. El shop lo consume para mostrar precios en la vitrina.

**Errores:** `404` — El producto no tiene pricing configurado.

---

### `POST /v1/pricing/calculate/combo` — Calcular precio real de combo

**Público** — sin autenticación. Los impuestos del combo se calculan con prorrateo lineal entre los productos componentes.

**Errores:** `404` — El combo no tiene pricing configurado.

---

## Reglas de negocio

| Regla | Dónde se aplica |
|---|---|
| Un producto/combo puede tener exactamente UN pricing | Unique index en DB + check previo en `create()` + manejo de error `23505` |
| "Ya tiene pricing" lanza `409 Conflict`, no 400 | `ConflictException` en pre-check y en catch de `PG_UNIQUE_VIOLATION` |
| El margen es opcional | `marginId` ausente o `null` → `margin = null` → no se aplica margen en cálculo |
| Para desasignar el margen en un update, enviar `marginId: null` | `UpdateProductPricingDto.marginId?: number \| null` con `@ValidateIf` |
| Todos los porcentajes (descuento, margen, impuestos, cupón) son siempre % | `applyValue(base, value, true)` hardcodeado — sin modo monto fijo |
| Soft delete — no se borra físicamente | `repo.softDelete(id)` setea `deletedAt` |
| El descuento activo se verifica por fechas en memoria | `isActive(startsAt, endsAt, now)` en `CalculationService` |
| Los impuestos globales y específicos no se duplican | `Set<number>` de IDs en `fetchTaxesForProduct` descarta globales ya incluidos como específicos |
| Impuestos de combo por prorrateo — no hay `combo-taxes` | `fetchTaxDataForCombo()` fetcha globales + items + pricings de referencia + taxes de productos en queries batched; `computeTaxesFromData()` aplica el prorrateo (precio_combo × refPrice/totalRef) sin queries adicionales |
| `calculateProduct` y `calculateCombo` son públicos | El shop los llama sin autenticación; `preview` requiere admin |
| Mutations de pricing invalidan la caché del shop | `ProductPricingService` y `ComboPricingService` llaman `shopCacheService.invalidate()` (fire-and-forget) en `create`, `update` y `remove` |
| Race condition en `create` cubierta con `PG_UNIQUE_VIOLATION` | Si dos requests concurrentes pasan el check previo, la segunda falla en `repo.save()` con error `23505` → `409` |

---

## Ejemplos de uso real

**Crear pricing de un producto con margen:**
```json
POST /v1/product-pricing
{ "productId": 5, "currency": "ARS", "unitPrice": 1200, "marginId": 2 }
```

**Cambiar solo el precio base:**
```json
PATCH /v1/product-pricing/3
{ "unitPrice": 1350 }
```

**Quitar el margen de un pricing:**
```json
PATCH /v1/product-pricing/3
{ "marginId": null }
```

**Preview antes de cargar datos:**
```json
POST /v1/pricing/calculate/preview
{
  "unitPrice": 1000,
  "marginValue": 30,
  "taxes": [{ "value": 21 }]
}
→ { "finalPrice": 1573, "fullPrice": 1573, "discount": 0, "coupon": 0, ... }
```

---

## Cumplimiento con agent skills

| Convención | Estado | Detalle |
|---|---|---|
| Entidades extienden `BaseEntity` | ✅ | |
| Soft delete con `softDelete()` | ✅ | |
| Snake_case en columnas, camelCase en TS | ✅ | |
| Services devuelven DTOs, nunca la entidad | ✅ | |
| `findOneEntity()` privado con `NotFoundException` | ✅ | |
| Guards a nivel de clase | ✅ | product-pricing y combo-pricing controllers |
| Rutas específicas antes de genéricas | ✅ | `/product/:productId` antes de `/:id` |
| `ConflictException` para recursos ya existentes | ✅ | `create()` lanza 409 en lugar de 400 |
| Mensajes de error en español | ✅ | Todos los servicios del módulo |
| Prorrateo de impuestos en combos sin N+1 | ✅ | `fetchTaxDataForCombo()` (queries batched con `In([...])`) + `computeTaxesFromData()` (cómputo puro, sin DB) |
| Cache invalidation en mutations | ✅ | `shopCacheService.invalidate()` en create/update/remove de product y combo pricing |
| `PartialType` + `OmitType` para UpdateDto | ✅ | |
| Unit tests con factory functions | ✅ | |

---

## Tests

### Unit tests

```bash
npx jest --testPathPattern="pricing" --no-coverage
```

| Suite | Tests | Qué cubre |
|---|---|---|
| `ProductPricingService` | 16 | create (con/sin margen, 409 ya existe, 404 margen, race condition 409), findAll, findOne, findByProduct, update, remove |
| `ComboPricingService` | 14 | Misma cobertura que ProductPricingService para combos |
| `CalculationService` | 8 | calculateProduct (200, 404), calculateCombo (prorrateo, globales, doble conteo, quantity>1, sin pricing), preview |
| `ProductPricingController` | 7 | Delegación a service para cada endpoint |
| `ComboPricingController` | 7 | Delegación a service para cada endpoint |
| `CalculationController` | 6 | preview (admin), calculateProduct (público), calculateCombo |

**Total unit: 58 tests**

### E2E tests

```bash
npx jest --config test/jest-e2e.json --testPathPattern="pricing"
```

| Caso | Status esperado |
|---|---|
| Crear sin margen | 201 |
| Crear con margen | 201 |
| Crear cuando ya existe | **409** |
| Crear con campos faltantes | 400 |
| Crear con margen inexistente | 404 |
| Listar paginado | 200 |
| Obtener por ID | 200 / 404 |
| Obtener por productId/comboId | 200 / 404 |
| Actualizar precio | 200 |
| Desvincular margen con null | 200 |
| Actualizar inexistente | 404 |
| Eliminar y verificar 404 | 204 → 404 |
| Eliminar inexistente | 404 |

Los mismos casos existen para `combo-pricing`. **Total e2e: 34 tests**

> `CalculationController` no tiene e2e — sus endpoints son ejercitados indirectamente a través del shop y del flujo de órdenes.

---

## Integración con otros módulos

```
ProductEntity ─────────────────┐
ComboEntity  ─────────────────┤
                               ↓
MarginEntity ──────────── ProductPricingEntity / ComboPricingEntity
                               ↓
                         CalculationService
                         ↑           ↑           ↑           ↑
              TaxEntity  DiscountProductTarget  DiscountComboTarget  ComboItemEntity
              (global +  (descuento vigente     (descuento vigente   (prorrateo de
              específico) por fechas)            por fechas)          impuestos)
                               ↓
                    PriceBreakdownDto
                    ↑                ↑
               ShopModule       OrdersService
```
