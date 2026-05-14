# Análisis General del Backend — Waiona Core

> Fecha: 2026-05-14  
> Revisado por: Claude (análisis estático completo del código fuente)  
> Alcance: todos los módulos en `src/`, entidades, servicios, controladores, guards, DTOs, tests, Docker, y agentes

---

## 1. Resumen Ejecutivo

El backend está bien estructurado para un e-commerce de mediana complejidad. Sigue las convenciones de NestJS de forma consistente, tiene una buena separación de responsabilidades a nivel de módulos, y cubre los flujos críticos de negocio (auth, órdenes, stock, pagos). Sin embargo, hay **bugs funcionales críticos en la atomicidad del stock**, **huecos de seguridad reales** (ownership checks ausentes, CORS ausente, sin rate limit), y **problemas de diseño** que se van a sentir en escala o en auditoría de producción.

---

## 2. Lo que está bien hecho (mantener)

| Area | Detalle |
|---|---|
| **Soft delete** | Patrón consistente con `isDeleted` en todas las entidades vía `BaseEntity`. |
| **Validación de entrada** | `ValidationPipe` con `whitelist + forbidNonWhitelisted + transform`. Sólido. |
| **ClassSerializerInterceptor global** | Excluye `password` de respuestas automáticamente. |
| **JWT con expiración** | `expiresIn: '6d'` configurado en `AuthModule`. |
| **Transacciones con DataSource** | Usadas correctamente para coupon usage, user+profile creation, webhook MP. |
| **Token de activación/reset** | `randomBytes(32)` + expiración + `usedAt`. Correcto. |
| **Firma de webhook MP** | HMAC-SHA256 con `x-signature` implementado. Buen patrón de seguridad. |
| **RolesGuard sin DB** | Lee el rol directo del JWT payload. Sin query extra. |
| **Seed idempotente** | Roles y superadmin solo se crean si no existen. |
| **Stock con reserva/despacho/liberación** | El ciclo completo está modelado correctamente en `StockItemsService`. |
| **Motor de cálculo de precios** | Claro, testeado, con breakdown completo. |
| **Agentes y skills** | Sistema de skills para guiar a IAs es un diferencial de calidad. |
| **DTO de errores no revelan info** | `forgotPassword` siempre devuelve 200 aunque el email no exista. |
| **Índices en entidades** | Bien puestos en `products`, `stock_items`, `tokens`, `payments`. |
| **Docker multi-stage** | Build stage separado, imagen de producción sin devDeps. |
| **quantityAvailable como getter** | Calculado en la entidad, no almacenado, siempre consistente. |

---

## 3. Bugs Críticos

### 3.1 Stock reservation fuera de la transacción de orden (BUG CRÍTICO)

**Archivo:** `src/modules/orders/services/orders.service.ts` — línea ~190  
**Severidad:** CRITICA — puede generar stock negativo o inconsistencias reales

Dentro del `dataSource.transaction(async manager => {...})`:

```typescript
const savedOrder = await manager.save(OrderEntity, order);

// stockItemsService usa su PROPIO repositorio inyectado, NO el manager
await this.stockItemsService.reserveStock(
  reservation.productId,
  reservation.locationId,
  reservation.quantity,
);
```

`stockItemsService.reserveStock()` llama `this.stockItemRepository.save(stockItem)` usando el repositorio inyectado, que **no participa de la transacción del manager**. Esto significa:

- Si `manager.save(OrderEntity)` falla **después** de la reserva → stock reservado sin orden.
- Si el save del coupon falla → stock reservado, orden creada sin cupón registrado.
- En concurrencia: dos requests simultáneas pueden ambas pasar el check de stock (pre-transacción) y ambas reservar.

**Fix necesario:** Pasar el `manager` a `reserveStock`, o hacer la operación de stock directamente dentro del bloque de transacción usando el `EntityManager`.

---

### 3.2 Race condition en cupón (TOCTOU)

**Archivo:** `orders.service.ts` línea ~140-180

La validación del cupón (check de `usageCount >= usageLimit`, check de `alreadyUsed`) ocurre **antes** de la transacción. Dos requests concurrentes con el mismo cupón pueden ambas pasar la validación y ambas aplicar el descuento, violando el límite de uso.

**Fix necesario:** Usar `SELECT ... FOR UPDATE` (pessimistic lock) sobre el cupón dentro de la transacción, o usar un `UNIQUE CONSTRAINT` en `coupon_usages(coupon_id, user_id)` como última línea de defensa (ya existe en `CouponUsageService` pero no se aprovecha aquí).

---

### 3.3 Dispatch/release usa ubicación incorrecta para combos

**Archivo:** `orders.service.ts` — `handleDispatch` y `handleCancellation`

Para despachar/liberar stock de un combo, hace:
```typescript
const stockItem = await this.stockItemRepo.findOne({
  where: { productId: comboItem.productId, isDeleted: false },
});
```

Esto obtiene el **primer** stock item encontrado para ese producto, que puede no coincidir con la ubicación donde se hizo la reserva original. Un producto puede tener stock en múltiples ubicaciones. Si la reserva se hizo en `locationId=2` pero el dispatch encuentra `locationId=1`, las cantidades quedan inconsistentes.

---

## 4. Problemas de Seguridad

### 4.1 Sin ownership check en GET /orders/:id

**Archivo:** `orders.controller.ts` — `findOne`

Cualquier cliente autenticado puede ver cualquier orden pasando su ID. Solo `findByUser` tiene el check, pero `findOne` no. Un cliente puede enumerar órdenes de otros usuarios.

```typescript
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.ordersService.findOne(id);  // sin verificar que sea del usuario autenticado
}
```

---

### 4.2 Sin ownership check en pagos

**Archivo:** `payments.controller.ts`

- `GET /payments/:id` — cualquier JWT válido puede ver el pago.
- `POST /payments` — un cliente puede crear un pago para una orden que no le pertenece.
- `GET /payments/order/:orderId` — ídem.

---

### 4.3 Sin CORS configurado

**Archivo:** `main.ts`

No hay `app.enableCors()`. En producción, el browser bloqueará solicitudes del frontend salvo que estén en el mismo origen. Alternativamente, si no se configura, podría quedar abierto por defecto en algunas configuraciones.

---

### 4.4 Sin rate limiting

No hay `@nestjs/throttler` ni ningún throttle middleware. Endpoints expuestos a abuso:

- `POST /auth/login` → brute force de contraseñas.
- `POST /auth/forgot-password` → email bombing (enviar miles de mails).
- `POST /auth/register` → registro masivo de cuentas basura.
- `GET /shop/items` → scraping masivo sin costo.

---

### 4.5 Sin Helmet (security headers ausentes)

No se usan headers de seguridad HTTP (CSP, X-Frame-Options, HSTS, etc.). Sin `@fastify/helmet` o `helmet` para Express.

---

### 4.6 Webhook secret bypass en desarrollo

**Archivo:** `payments.controller.ts` — `verifyMercadoPagoSignature`

```typescript
if (!secret) return; // si no hay secret configurado skip — útil en dev
```

Si `MP_WEBHOOK_SECRET` no está seteado en un ambiente que no sea dev (staging mal configurado), cualquiera puede enviar webhooks falsos y manipular estados de órdenes y pagos.

---

### 4.7 JWT con duración de 6 días sin revocación

No hay blacklist de tokens ni refresh token. Si un token es comprometido, es válido 6 días completos. No hay `POST /auth/logout`.

---

## 5. Problemas de Diseño y Arquitectura

### 5.1 N+1 queries en el Shop (escala)

**Archivo:** `shop.service.ts`

Para cada producto en el listado (`limit=20`), se ejecutan:
- `calculationService.calculateProduct()` → 4–6 queries (pricing, discount, taxes×2, coupon targets)
- `stockItemsService.findByProduct()` → 1 query

Para una página de 20 productos + 20 combos → ~200 queries por request. En tráfico real esto será un cuello de botella importante.

**Fix:** Cachear precios calculados (Redis/in-memory con TTL corto) o desnormalizar `finalPrice` en la entidad y recalcular solo cuando cambia pricing/discount.

---

### 5.2 Paginación del shop es incorrecta

**Archivo:** `shop.service.ts` — método `search`

```typescript
// Productos: skip y take aplicados
const [products, count] = await this.productRepository.findAndCount({
  take: limit, skip,
});
// Combos: skip y take aplicados por separado
const [combos, count2] = await this.comboRepository.findAndCount({
  take: limit, skip,
});
total += count + count2;
```

El `skip` y `take` se aplican **por tipo por separado**. Una búsqueda mixta (`type=undefined`) en la página 2 devuelve los items 21–40 de productos + items 21–40 de combos, no los items 21–40 de la lista combinada. El `total` tampoco refleja correctamente los resultados filtrados por `minPrice/maxPrice`.

---

### 5.3 Filtrado de precio post-query

**Archivo:** `shop.service.ts`

```typescript
if (minPrice !== undefined && priceData.finalPrice < minPrice) return null;
if (maxPrice !== undefined && priceData.finalPrice > maxPrice) return null;
```

El filtro de precio se hace en TypeScript, después de traer todos los items de la DB. Esto rompe la paginación (una página de 20 items podría devolver 5 si muchos no pasan el filtro) y hace el filtro ineficiente.

---

### 5.4 OrdersService hace demasiado

`orders.service.ts` tiene ~350 líneas y orquesta: validación de items, cálculo de precios, validación de stock, validación de coupon, transacción completa, manejo de dispatch, manejo de cancelación. Debería delegar más en servicios especializados.

---

### 5.5 Snapshot de precio incompleto en OrderItem

`OrderItemEntity` guarda `unitPrice` y `finalPrice` pero no los componentes del breakdown (discount, taxes, margin). Si se necesita auditar por qué el cliente pagó ese precio, no hay información suficiente.

---

### 5.6 Relación orden↔pago comentada

**Archivo:** `order.entity.ts`

```typescript
//  @OneToOne(() => PaymentEntity, { nullable: true })
//  @JoinColumn({ name: 'payment_id' })
//    payment?: PaymentEntity | null;
```

No hay forma de navegar de una orden a su pago desde el lado de la orden. Esto complica cualquier lógica que necesite saber si una orden fue pagada sin hacer una query adicional al servicio de pagos.

---

### 5.7 Webhook MP usa MerchantOrder para topic=payment

**Archivo:** `payments.service.ts` — `handleMercadoPagoWebhook`

Cuando el topic es `payment`, el `id` que llega es un **Payment ID**, no un Merchant Order ID. El código usa `new MerchantOrder(...).get({ merchantOrderId: Number(id) })` para ambos casos. Para notificaciones de tipo `payment`, debería usar el Payment API.

---

### 5.8 No hay migraciones reales

El `Dockerfile` ejecuta `npm run migration:run` antes de arrancar, pero **no existen archivos de migración** en el repo. El script va a fallar en un contenedor de producción limpio. La opción actual de producción implica `synchronize: true` (peligroso) o configurar migraciones antes de deployar.

---

### 5.9 CouponUsageService duplica lógica de orders

`coupon-usage.service.ts` tiene un método `create()` completo con validación de cupón y transacción, pero `orders.service.ts` gestiona el uso del cupón directamente. El servicio standalone parece no ser llamado desde el flujo de órdenes, generando confusión sobre cuál es la fuente de verdad.

---

## 6. Lo Incompleto / Faltante

| Feature | Estado | Prioridad |
|---|---|---|
| **Emails en cambios de estado de orden** | Ausente — no hay notificación al cliente cuando su orden pasa de PENDING→CONFIRMED, etc. | Alta |
| **Flujo de reembolso** | No existe — si se cancela una orden CONFIRMADA (ya pagada), no hay reversa automática a MP. | Alta |
| **E2E tests** | Solo existen unit tests. El directorio `test/` y el script `test:e2e` existen pero no hay specs. | Alta |
| **Archivos de migración** | El Dockerfile los ejecuta pero no existen en el repo. | Alta |
| **CORS** | No configurado en `main.ts`. | Alta |
| **Rate limiting** | No implementado en ningún endpoint. | Alta |
| **Helmet** | Ausente. | Media |
| **Logout / revocación de JWT** | Sin blacklist ni refresh token. | Media |
| **Alertas de stock bajo** | Los thresholds existen (`stockMin`, `stockCritical`) pero no generan ninguna notificación/evento. | Media |
| **Timeline de estado de orden** | No hay audit trail de cuándo cambió cada estado. | Media |
| **Notificación a admin por nueva orden** | No hay webhook, email, ni evento cuando llega una orden nueva. | Media |
| **Versionado de API** | No hay prefijo `/v1/`. Un breaking change afecta a todos los clientes. | Media |
| **Paginación en GET /orders (admin)** | `findAll` devuelve TODAS las órdenes sin limit/skip. Escala mal. | Media |
| **README real** | El README es el template default de NestJS. Sin documentación de endpoints ni setup. | Baja |
| **Variantes de producto** | No soportado (talla, color, etc.). | Baja (roadmap) |
| **Descuento por categoría** | Solo hay descuento por producto o combo, no por categoría entera. | Baja (roadmap) |
| **Pickup scheduling** | `PICKUP` existe como DeliveryType pero sin horario/slot. | Baja (roadmap) |

---

## 7. Problemas Menores / Calidad de Código

### 7.1 Token entity tiene índice duplicado

**Archivo:** `token.entity.ts`

```typescript
@Column({ type: 'varchar', length: 255, nullable: false, unique: true })  // unique en columna
token: string;

@Index(['token'], { unique: true })  // mismo índice declarado a nivel de clase
```

Genera dos índices únicos idénticos en la DB.

---

### 7.2 ESLint version conflict

**Archivo:** `package.json`

```json
"eslint": "^4.1.1"        // ESLint v4 — muy viejo
"typescript-eslint": "^8.14.0"  // requiere ESLint 9+
```

Incompatibles. Esto puede provocar que el linter falle o no funcione correctamente.

---

### 7.3 docker-compose pasa variables de DB incorrectas al contenedor API

**Archivo:** `docker-compose.yaml`

```yaml
api:
  environment:
    DATABASE_HOST: postgres     # clave DATABASE_HOST
    DATABASE_PORT: 5432
```

Pero la app espera `POSTGRES_HOST`, `POSTGRES_PORT` (según `env.model.ts` y `app.module.ts`). Estas variables del docker-compose no coinciden con las que lee la aplicación. La app las tomaría del `.env` vía `env_file`, pero las variables de `environment` quedarían ignoradas.

---

### 7.4 Uso de `any` en webhook handler

**Archivo:** `payments.service.ts` y `payments.controller.ts`

```typescript
async handleMercadoPagoWebhook(body: any, query: any): Promise<void>
```

No hay tipado del body del webhook. Esto hace que `body` y `query` sean opacas y propensas a errores en el acceso a propiedades.

---

### 7.5 `findAll` de órdenes expone datos de usuario completos

`ordersService.findAll()` carga la relación `user` completa (con profile). En la respuesta al admin, se devuelven datos que podrían ser más selectivos.

---

### 7.6 `safeCalculate*` en ShopService swallows todos los errores

```typescript
private async safeCalculateProduct(...): Promise<PriceBreakdownDto | null> {
  try { return ...; } catch { return null; }
}
```

Silencia errores reales (bugs en la lógica de pricing, DB caída) tratándolos igual que "sin pricing configurado". Un producto con bug de precios simplemente desaparece del shop sin log ni alerta.

---

### 7.7 Password expuesta en seed log implícito

Si NestJS loguea las variables de entorno en algún modo verbose, `SUPERADMIN_PASSWORD` podría aparecer. Menor, pero a considerar.

---

## 8. Riesgos para Producción

| Riesgo | Probabilidad | Impacto |
|---|---|---|
| Stock negativo por race condition en reserva | Media | Critico — overselling real |
| Cupón usado múltiples veces concurrentemente | Media | Alto — pérdida financiera |
| GET /orders/:id sin ownership | Alta (cualquier usuario) | Alto — fuga de datos |
| Sin rate limit en login | Alta | Medio — brute force |
| Sin migraciones → Dockerfile falla en prod | Alta (primera deploy) | Critico — app no arranca |
| N+1 en shop bajo carga | Alta | Medio — lentitud, timeout |
| Webhook MP sin secret en staging | Media | Alto — manipulación de estado |

---

## 9. Lo que NO cambiar

- La arquitectura modular de NestJS está bien — no flat, no over-engineered.
- El `RolesGuard` leyendo del JWT sin DB query es correcto y performante.
- El `ClassSerializerInterceptor` global para excluir `password` es el patrón correcto.
- Los `@BeforeInsert` hooks para hashear passwords funcionan bien con TypeORM.
- El motor de cálculo de precios en `CalculationService` es claro y correcto.
- La estructura de agentes y skills es valiosa — mantenerla y expandirla.
- Los unit tests con factory functions y `jest.clearAllMocks()` son un buen patrón.
- El soft delete con `isDeleted` es correcto para este dominio.

---

## 10. Checklist de Acciones Recomendadas por Prioridad

### Urgente (antes de ir a producción)

- [ ] Arreglar atomicidad de `reserveStock` dentro de la transacción de la orden
- [ ] Agregar `SELECT FOR UPDATE` (pessimistic lock) en validación de cupón
- [ ] Agregar ownership check en `GET /orders/:id`, `GET /payments/:id`, `POST /payments`
- [ ] Crear migraciones TypeORM y eliminar el `synchronize` del Dockerfile
- [ ] Configurar CORS en `main.ts` (`app.enableCors(...)`)
- [ ] Agregar `@nestjs/throttler` en endpoints de auth

### Importante (primera iteración post-lanzamiento)

- [ ] Arreglar location tracking en dispatch/release de stock para combos
- [ ] Agregar Helmet para security headers
- [ ] Implementar paginación en `GET /orders` (admin)
- [ ] Arreglar paginación del shop para listas mixtas producto+combo
- [ ] Agregar emails de notificación en cambios de estado de orden
- [ ] Arreglar el topic `payment` del webhook MP para usar Payment API, no MerchantOrder
- [ ] Eliminar el índice único duplicado en `token.entity.ts`
- [ ] Corregir mismatch de variables de entorno en `docker-compose.yaml` (DATABASE_HOST vs POSTGRES_HOST)
- [ ] Actualizar ESLint a v9+ o bajar `typescript-eslint` a versión compatible

### Roadmap / Mejoras

- [ ] Implementar refresh token + logout con blacklist
- [ ] Cachear precios calculados (Redis) para evitar N+1 en shop
- [ ] Habilitar la relación `order.payment` (actualmente comentada en `order.entity.ts`)
- [ ] Agregar snapshot completo de breakdown de precio en `OrderItemEntity`
- [ ] Alertas cuando stock cae por debajo de `stockMin`/`stockCritical`
- [ ] Timeline de estados de orden (audit log)
- [ ] E2E tests contra DB real (infraestructura ya existe con `postgres_test` en docker-compose)
- [ ] Flujo de reembolso al cancelar orden pagada
- [ ] Versionado de API (`/v1/`)
- [ ] Notificación a admin en nueva orden

---

## 11. Fixes Aplicados

| # | Bug (ref. sección) | Archivos modificados | Fecha | Notas |
|---|---|---|---|---|
| 1 | **3.1 — Stock reservation fuera de la transacción** | `stock-item.service.ts`, `orders.service.ts` | 2026-05-14 | `reserveStock` acepta `manager?: EntityManager` opcional. `orders.service` pasa el `manager` de la transacción. La reserva ahora es atómica con el save de la orden y el registro del cupón. |
| 2 | **3.2 — Race condition en cupón (TOCTOU)** | `orders.service.ts`, `orders.module.ts` | 2026-05-14 | La validación del cupón se movió dentro de la transacción con `lock: { mode: 'pessimistic_write' }`. PostgreSQL bloquea la fila del cupón hasta que la transacción confirma, impidiendo que dos requests concurrentes superen el límite de uso. Se eliminaron `couponRepo` y `couponUsageRepo` del constructor (ahora se usa el `manager` directamente). |
| 3 | **3.3 — Dispatch/release usa ubicación incorrecta + inconsistencia shop/orden** | `order-item.entity.ts`, `orders.service.ts` | 2026-05-14 | `findAvailableStockItem` cambió de `findOne` a `find` + mejor ubicación por `quantityAvailable` (igual que el shop). Para productos: columna `location_id` en `order_items` persiste la ubicación exacta; dispatch/release la usan directamente. Para combos: helper `findStockItemWithReservation` busca la ubicación con `quantityReserved >= requerido` — la que acumuló la reserva. |
