# Pricing — Análisis Técnico Completo

## ¿Qué es el módulo de pricing?

El módulo de pricing centraliza la configuración de precios y el motor de cálculo de la plataforma. Se compone de tres sub-módulos:

- **ProductPricing** — almacena el precio base (`unitPrice`), moneda y margen opcional de cada producto.
- **ComboPricing** — ídem para combos.
- **Calculation** — motor de cálculo que combina pricing, margen, descuentos vigentes e impuestos para producir el desglose completo del precio final.

El módulo se ubica entre el catálogo (productos/combos) y el motor de órdenes. Tanto el shop como el proceso de creación de órdenes lo consumen para conocer el precio real en tiempo de ejecución.

```
unitPrice
  → descuento activo (por fechas)   → priceAfterDiscount
  → margen del pricing               → priceAfterMargin
  → impuestos específicos + globales → finalPrice      ← precio con descuento
  → cupón (nivel orden)              → orderTotal       ← lo que paga el cliente

fullPrice = unitPrice + margen(sobre unitPrice) + impuestos(sobre eso)  ← precio tachado del front
```

---

## Cuándo se usa en el negocio

| Escenario | Ejemplo |
|---|---|
| Alta de producto nuevo | Se crea `ProductPricing` con unitPrice y moneda al cargar un producto al catálogo |
| Asignar margen de ganancia | Admin vincula un margen `20%` al pricing de un producto |
| Quitar el margen | Admin envía `marginId: null` en el update para desvincular el margen |
| Shop mostrando precio | `POST /pricing/calculate/product` retorna `finalPrice` y `fullPrice` para mostrar precio actual y tachado |
| Probar combinaciones antes de publicar | Admin usa `POST /pricing/calculate/preview` con valores manuales sin tocar datos reales |
| Actualizar precio base | `PATCH /product-pricing/:id` con el nuevo `unitPrice` |

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
  data:  ProductPricingResponseDto[];  // (o ComboPricingResponseDto[])
  total: number;
  page:  number;
  limit: number;
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

```typescript
{
  unitPrice:            number;           // requerido
  discountValue?:       number;           // opcional — monto del descuento
  discountIsPercentage?: boolean;         // true = %, false = monto fijo
  marginValue?:         number;           // opcional
  marginIsPercentage?:  boolean;
  taxes?: {
    value:        number;
    isPercentage: boolean;
  }[];                                    // array de impuestos a simular
  couponValue?:         number;           // opcional — se aplica sobre finalPrice
  couponIsPercentage?:  boolean;
}
```

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

### `POST /product-pricing` — Crear pricing de producto

Requiere: `SUPER_ADMIN` o `ADMIN`.

**Request:**
```json
{
  "productId": 1,
  "currency": "ARS",
  "unitPrice": 500,
  "marginId": 1
}
```

**Response 201:**
```json
{
  "id": 1,
  "productId": 1,
  "currency": "ARS",
  "unitPrice": 500,
  "marginId": 1,
  "createdAt": "2026-05-18T00:00:00.000Z",
  "updatedAt": "2026-05-18T00:00:00.000Z"
}
```

**Errores:**
- `400` — El producto ya tiene pricing (check previo + manejo de `PG_UNIQUE_VIOLATION 23505` para race condition)
- `400` — Datos inválidos (validación de DTO)
- `404` — El `marginId` no existe

---

### `GET /product-pricing` — Listar pricings de productos (paginado)

Requiere: `SUPER_ADMIN` o `ADMIN`. Query params: `page` (default 1), `limit` (default 20).

**Response 200:**
```json
{
  "data": [{ "id": 1, "productId": 1, "currency": "ARS", "unitPrice": 500, "marginId": 1, "createdAt": "...", "updatedAt": "..." }],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

---

### `GET /product-pricing/product/:productId` — Obtener pricing por producto

Requiere: `SUPER_ADMIN` o `ADMIN`. Ruta específica declarada **antes** de `GET /:id` para evitar conflicto de rutas.

**Response 200:** `ProductPricingResponseDto`

**Errores:** `404` — No hay pricing para ese producto.

---

### `GET /product-pricing/:id` — Obtener pricing por ID

Requiere: `SUPER_ADMIN` o `ADMIN`.

**Response 200:** `ProductPricingResponseDto`

**Errores:** `404` — No encontrado.

---

### `PATCH /product-pricing/:id` — Actualizar pricing (parcial)

Requiere: `SUPER_ADMIN` o `ADMIN`. Acepta cualquier subconjunto de `UpdateProductPricingDto`.

**Request (desvincula margen):**
```json
{ "marginId": null }
```

**Response 200:** `ProductPricingResponseDto` actualizado.

**Errores:**
- `404` — Pricing no encontrado
- `404` — `marginId` referencia un margen inexistente

---

### `DELETE /product-pricing/:id` — Eliminar pricing (soft delete)

Requiere: `SUPER_ADMIN` o `ADMIN`.

**Response 204:** Sin cuerpo.

**Errores:** `404` — No encontrado.

---

### Endpoints de `combo-pricing`

Mismos endpoints, misma lógica, mismos códigos de error. Rutas: `/combo-pricing`, `/combo-pricing/combo/:comboId`, `/combo-pricing/:id`.

---

### `POST /pricing/calculate/preview` — Preview sin DB

Requiere: `SUPER_ADMIN` o `ADMIN`. Calcula el desglose completo con valores manuales sin consultar la base de datos.

**Request:**
```json
{
  "unitPrice": 500,
  "discountValue": 10,
  "discountIsPercentage": true,
  "marginValue": 20,
  "marginIsPercentage": true,
  "taxes": [{ "value": 21, "isPercentage": true }],
  "couponValue": 50,
  "couponIsPercentage": false
}
```

**Response 200:**
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
  "coupon": 50,
  "orderTotal": 603.4
}
```

---

### `POST /pricing/calculate/product` — Calcular precio real de producto

**Público** — sin autenticación. El shop lo consume para mostrar precios en la vitrina.

**Request:**
```json
{ "productId": 1 }
```

**Response 200:** `PriceBreakdownDto` con `coupon: 0` y `orderTotal === finalPrice` (el cupón se aplica a nivel orden, no aquí).

**Errores:** `404` — El producto no tiene pricing configurado.

---

### `POST /pricing/calculate/combo` — Calcular precio real de combo

**Público** — sin autenticación. Misma lógica que el anterior para combos.

**Errores:** `404` — El combo no tiene pricing configurado.

---

## Reglas de negocio

| Regla | Dónde se aplica |
|---|---|
| Un producto/combo puede tener exactamente UN pricing | Unique index en DB + check previo en `create()` + manejo de error `23505` |
| El margen es opcional | `marginId` ausente o `null` → `margin = null` → no se aplica margen en cálculo |
| Para desasignar el margen en un update, enviar `marginId: null` | `UpdateProductPricingDto.marginId?: number | null` con `@ValidateIf` |
| Soft delete — no se borra físicamente | `repo.softDelete(id)` setea `deletedAt`; el registro no aparece en futuras consultas |
| El descuento activo se verifica por fechas en memoria | `isActive(startsAt, endsAt, now)` en `CalculationService` — sin índices adicionales |
| Los impuestos globales y específicos no se duplican | `Set<number>` de IDs en `fetchTaxesForProduct/Combo` descarta globales ya incluidos como específicos |
| `calculateProduct` y `calculateCombo` son públicos | El shop los llama sin autenticación; `preview` requiere admin |
| `fullPrice` = precio sin descuento, con margen e impuestos recalculados sobre `unitPrice` | Calculado en paralelo dentro del mismo método — para mostrar precio tachado en el front |
| Race condition en `create` cubierta con `PG_UNIQUE_VIOLATION` | Si dos requests concurrentes pasan el check previo, la segunda falla en `repo.save()` con error `23505` → `400` |

---

## Ejemplos de uso real

**Crear pricing de un producto con margen:**
```json
POST /product-pricing
{
  "productId": 5,
  "currency": "ARS",
  "unitPrice": 1200,
  "marginId": 2
}
```

**Cambiar solo el precio base:**
```json
PATCH /product-pricing/3
{ "unitPrice": 1350 }
```

**Quitar el margen de un pricing:**
```json
PATCH /product-pricing/3
{ "marginId": null }
```

**Shop consultando el precio de un producto:**
```json
POST /pricing/calculate/product
{ "productId": 5 }
→ { "finalPrice": 1742.4, "fullPrice": 1742.4, "discount": 0, ... }
```

**Preview antes de cargar datos:**
```json
POST /pricing/calculate/preview
{
  "unitPrice": 1000,
  "marginValue": 30,
  "marginIsPercentage": true,
  "taxes": [{ "value": 21, "isPercentage": true }]
}
→ { "finalPrice": 1573, "fullPrice": 1573, "discount": 0, "coupon": 0, ... }
```

---

## Cumplimiento con agent skills

| Convención | Estado |
|---|---|
| Entidades extienden `BaseEntity` | ✅ |
| Soft delete con `softDelete()` | ✅ |
| Snake_case en columnas, camelCase en TS | ✅ |
| Services devuelven DTOs, nunca la entidad | ✅ |
| `findOneEntity()` privado con `NotFoundException` | ✅ |
| Guards a nivel de clase donde todos los endpoints requieren el mismo acceso | ✅ (product-pricing y combo-pricing controllers) |
| Rutas específicas antes de genéricas (`/product/:productId` antes de `/:id`) | ✅ |
| `@Type(() => Number)` en query params numéricos | ✅ (vía `PaginationQueryDto`) |
| `PartialType` + `OmitType` para UpdateDto | ✅ |
| `class-validator` en todos los DTOs | ✅ |
| Decoradores Swagger (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`) | ✅ en product/combo pricing; ⚠️ ausentes en `CalculationController` |
| Unit tests con factory functions y `jest.clearAllMocks()` | ✅ |
| `overrideGuard` en controller specs | ✅ |
| E2E tests con DB real (postgres test) | ✅ para product-pricing y combo-pricing; ⚠️ ausentes para calculation |

---

## Tests

### Unit tests

```bash
npx jest --testPathPattern="pricing"
```

| Suite | Tests | Qué cubre |
|---|---|---|
| `ProductPricingService` | 16 | create (con/sin margen, ya existe, margen no existe, race condition), findAll (con/sin resultados), findOne (200/404), findByProduct (200/404), update (actualiza, desvincula margen, 404), remove (soft delete, 404) |
| `ComboPricingService` | 14 | Misma cobertura que ProductPricingService para combos |
| `CalculationService` | 5 | calculateProduct (200, 404), calculateCombo (200, 404), preview (sin DB) |
| `ProductPricingController` | 7 | Delegación a service para cada endpoint |
| `ComboPricingController` | 7 | Delegación a service para cada endpoint |
| `CalculationController` | 5 | preview (admin), calculateProduct (público + coupon=0), calculateCombo |

**Total unit: 54 tests**

### E2E tests

```bash
npx jest --testPathPattern="test/pricing"
```

Los e2e usan una DB de test real (`POSTGRES_TEST_PORT=5433`, `POSTGRES_TEST_DB`). `dropSchema: true` limpia el esquema en cada ejecución.

| Caso | Endpoint | Status esperado |
|---|---|---|
| Crear sin margen | `POST /product-pricing` | 201 |
| Crear con margen | `POST /product-pricing` | 201 |
| Crear cuando ya existe | `POST /product-pricing` | 400 |
| Crear con campos faltantes | `POST /product-pricing` | 400 |
| Crear con margen inexistente | `POST /product-pricing` | 404 |
| Listar paginado | `GET /product-pricing` | 200 |
| Respetar limit=1 | `GET /product-pricing?page=1&limit=1` | 200 |
| Obtener por ID | `GET /product-pricing/:id` | 200 |
| Obtener por ID inexistente | `GET /product-pricing/:id` | 404 |
| Obtener por productId | `GET /product-pricing/product/:productId` | 200 |
| Obtener por productId inexistente | `GET /product-pricing/product/:productId` | 404 |
| Actualizar precio | `PATCH /product-pricing/:id` | 200 |
| Asignar margen | `PATCH /product-pricing/:id` | 200 |
| Desvincular margen con null | `PATCH /product-pricing/:id` | 200 |
| Actualizar inexistente | `PATCH /product-pricing/:id` | 404 |
| Eliminar y verificar 404 | `DELETE /product-pricing/:id` | 204 → 404 |
| Eliminar inexistente | `DELETE /product-pricing/:id` | 404 |

Los mismos 17 casos existen para `combo-pricing` en `combo-pricing.e2e-spec.ts`.

**Total e2e: 34 tests**

> `CalculationController` no tiene e2e — sus endpoints públicos son ejercitados indirectamente a través del shop y del flujo de órdenes en sus propios e2e. El cálculo matemático está cubierto en unit tests del service.

---

## Integración con otros módulos

```
ProductEntity ─────────────────┐
ComboEntity  ─────────────────┤
                               ↓
MarginEntity ──────────── ProductPricingEntity / ComboPricingEntity
                               ↓
                         CalculationService
                         ↑           ↑           ↑
              TaxEntity  DiscountProductTarget  DiscountComboTarget
              (global +  (descuento vigente     (descuento vigente
              específico) por fechas)            por fechas)
                               ↓
                    PriceBreakdownDto
                    ↑                ↑
               ShopModule       OrdersService (calcula precio al crear orden)
```

- **ShopModule** — llama `calculateProduct` y `calculateCombo` para mostrar precios en la vitrina pública.
- **OrdersService** — llama `calculateProduct` / `calculateCombo` al crear una orden para fijar el precio en ese momento.
- **MarginsModule** — provee las entidades `MarginEntity` que se vinculan al pricing.
- **TaxationModule** — provee `TaxEntity`, `ProductTaxEntity`, `ComboTaxEntity` que el `CalculationService` consulta para sumar impuestos.
- **DiscountsModule** — provee `DiscountProductTargetEntity` y `DiscountComboTargetEntity` para aplicar descuentos vigentes.
