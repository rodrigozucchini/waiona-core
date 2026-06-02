```ts
// Archivo: src/common/cache/shop-cache.service.ts
// Archivo: src/common/cache/cache.module.ts

// ==========================
// ¿Por qué existe este servicio?
// ==========================
// El endpoint GET /shop es público y lo llaman todos los clientes.
// Sin cache, cada request haría varios joins contra la DB.
// Redis permite guardar datos que no cambian frecuentemente y servirlos
// sin tocar la DB.

// ==========================
// Patrón: versioned key invalidation
// ==========================
// En vez de guardar: "shop:productos" → datos
// Se guarda:         "shop:v3:productos" → datos
//
// Para invalidar, se sube la versión: v3 → v4.
// Todos los reads futuros buscan "shop:v4:..." → cache miss → repopula.
// Las keys viejas "shop:v3:..." quedan huérfanas y expiran solas con TTL.
// No hace falta borrar nada explícitamente.

const VERSION_KEY = 'shop:__version__';
const SHOP_TTL_MS = 60_000;
const VERSION_TTL_MS = 365 * 24 * 60 * 60 * 1000; // permanente en la práctica

@Injectable()
export class ShopCacheService {
  constructor(@Inject(CACHE_MANAGER) cache: object) {
    this.cache = cache as Cache;
  }

  async get<T>(key: string): Promise<T | undefined> {
    const v = await this.getVersion();
    return this.cache.get<T>(`shop:v${v}:${key}`);
  }

  async set<T>(key: string, value: T): Promise<void> {
    const v = await this.getVersion();
    await this.cache.set(`shop:v${v}:${key}`, value, SHOP_TTL_MS);
  }

  // Invalida todo el shop cache bumpeando la versión global.
  // Todas las keys anteriores quedan inaccesibles y expiran solas.
  async invalidate(): Promise<void> {
    const current = (await this.cache.get<number>(VERSION_KEY)) ?? 0;
    await this.cache.set(VERSION_KEY, current + 1, VERSION_TTL_MS);
  }

  private async getVersion(): Promise<number> {
    return (await this.cache.get<number>(VERSION_KEY)) ?? 0;
  }
}
```

```ts
// @Global() → disponible en toda la app sin importar AppCacheModule en cada módulo.
@Global()
@Module({
  providers: [ShopCacheService],
  exports: [ShopCacheService],
})
export class AppCacheModule {}
```

---

## Decisión de diseño: qué cachear y qué no

Durante el desarrollo de este proyecto se analizó qué datos del shop tienen sentido cachear.

### Por qué NO se cachea el precio ni el stock

El cache del shop originalmente guardaba el response completo (precio incluido). Se removió porque:

- **Precio**: el cliente puede ver $1500 en pantalla y pagar $1600 si el admin actualizó el precio mientras el cache estaba activo. El precio cobrado en `POST /orders` siempre se calcula en vivo desde `CalculationService` — independientemente del cache del shop.
- **Stock**: cambia con cada orden despachada. Si el cache muestra "12 unidades" y el stock real es 0, el cliente intenta comprar algo que no hay.

La regla general: **cachear solo cuando el costo de datos viejos es bajo**.

### Por qué NO se cachea en las categorías

Todos los endpoints de `GET /categories` son admin-only (`@Roles(ADMIN)`). El cache del shop es para el usuario final — no tiene sentido aplicarlo a endpoints de gestión.

### Qué SÍ se cachea: metadata estática del shop

Solo `name`, `description` y `type` por producto/combo, bajo las keys:
- `product:meta:{id}` → `{ name, description, type: 'product' }`
- `combo:meta:{id}` → `{ name, description, type: 'combo' }`

Estos datos no tienen consecuencia económica si están desactualizados 60 segundos.

---

## Flujo actual del cache en shop.service.ts

```ts
// LISTADO (search) — warm-up del cache como side effect
// Ya tenemos la entidad del bulk find() — guardamos la metadata sin bloquear
void this.shopCacheService.set(`product:meta:${product.id}`, {
  name: product.name,
  description: product.description,
  type: 'product',
});

// DETALLE (findById) — lectura + escritura en paralelo con el findOne()
const [meta, product] = await Promise.all([
  this.shopCacheService.get<StaticMeta>(`product:meta:${id}`),
  this.productRepository.findOne({ where: { id, isActive: true }, relations: ['images', 'category'] }),
]);

if (!meta) {
  void this.shopCacheService.set(`product:meta:${id}`, { name: product.name, description: product.description, type: 'product' });
}

return {
  name: meta?.name ?? product.name,  // usa cache si existe
  description: meta?.description ?? product.description,
  // precio y stock siempre desde el resultado en vivo
  finalPrice: priceData.finalPrice,
  inStock: stock.quantityAvailable > 0,
  ...
};
```

---

## Dónde se invalida y por qué

| Módulo | Método | Invalida | Por qué |
|---|---|---|---|
| `product.service` | `update()` | Sí | El nombre o descripción puede haber cambiado |
| `product.service` | `delete()` | Sí | El producto ya no existe |
| `combo.service` | `update()` | Sí | Ídem |
| `combo.service` | `delete()` | Sí | Ídem |
| `product.service` | `create()` | **No** | Un producto nuevo no tiene entry en cache |
| `combo.service` | `create()` | **No** | Ídem |
| Todos los demás módulos | — | **No** | Margins, taxes, pricing, discounts, etc. no afectan la metadata cacheada |

---

## Preguntas de comprensión

1. ¿Por qué `create()` no necesita invalidar el cache?
2. ¿Qué pasa si dos admins editan el mismo producto al mismo tiempo?
3. ¿Por qué la `VERSION_KEY` tiene TTL de 1 año y no infinito?
4. ¿Por qué el `set()` en el listado usa `void` (fire-and-forget)?
5. ¿Por qué el `findOne()` se sigue haciendo aunque haya cache hit en el detalle?

---

## Respuestas

1. No hay entry para ese producto — no hay nada que invalidar.
2. Ambos llaman `invalidate()` → ambos incrementan la versión. El resultado es que la versión queda en `+2`. No hay race condition porque Redis es single-threaded y las operaciones son atómicas.
3. Redis no tiene TTL infinito nativo. 1 año = permanente en la práctica.
4. Porque el listado ya tiene la data de la entidad. Guardar al cache es un bonus — no queremos que falle o demore la respuesta principal.
5. Porque siempre necesitamos las imágenes y la categoría, que no están en el cache. El `findOne()` es inevitable para el detalle.
