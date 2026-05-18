# Módulo de Pricing — Guía para el Negocio

## ¿Qué es el pricing?

El pricing es la configuración de precio que se le asigna a cada producto o combo del catálogo. Define cuánto cuesta un artículo antes de aplicar cualquier descuento, impuesto o ganancia.

Pensalo así: si un producto tiene un costo de $500, el pricing es el registro que guarda ese número, la moneda en que está expresado y el margen de ganancia que queremos sumarle.

---

## ¿Cómo se calcula el precio final?

Cuando el sistema necesita mostrar el precio de un producto (en la tienda o al crear un pedido), sigue estos pasos en orden:

```
Precio base
  → se le resta el descuento vigente (si hay uno activo en esa fecha)
  → se le suma el margen de ganancia
  → se le suman los impuestos aplicables
  → ese es el precio real que paga el cliente
```

Además, el sistema calcula un **precio sin descuento** — que es lo que aparece tachado en la tienda para mostrar el ahorro al cliente.

Si el cliente usa un cupón, ese descuento se aplica sobre el precio ya calculado, al momento de confirmar el pedido.

---

## ¿Para qué sirve este módulo?

Sin pricing configurado, un producto no tiene precio y no puede venderse ni aparecer correctamente en la tienda.

Este módulo le permite al equipo de administración:
- Cargar el precio base de cada artículo
- Asignar un margen de ganancia (porcentual o fijo)
- Cambiar el precio en cualquier momento sin afectar el historial de ventas
- Simular cuánto quedaría el precio final antes de publicar un cambio

---

## ¿Cómo funciona el margen?

El margen es la ganancia que el negocio agrega sobre el precio base. Puede definirse de dos formas:

| Tipo | Ejemplo |
|---|---|
| Porcentual | Precio base $500 + 20% de margen = $600 |
| Monto fijo | Precio base $500 + $150 de margen = $650 |

El margen no está pegado al producto directamente — se crea como una configuración reutilizable y luego se asigna al pricing del producto. Esto permite usar el mismo margen en muchos productos a la vez.

Si un producto no necesita margen, se puede dejar en blanco o quitarlo en cualquier momento.

---

## Cuándo se usa en el negocio

| Situación | Ejemplo de uso |
|---|---|
| Alta de un producto nuevo | Se carga el precio base y la moneda al crear el producto |
| Cambio de precios | Se actualiza el precio base de uno o varios productos |
| Asignar ganancia | Se vincula un margen del 25% al pricing de una línea de productos |
| Quitar ganancia temporalmente | Se desvincula el margen para una liquidación |
| Simular antes de publicar | El administrador prueba distintas combinaciones de precio, margen e impuesto sin guardar nada |
| Tienda mostrando precios | El sistema consulta el precio calculado de cada producto para mostrarlo al cliente |

---

## ¿Qué puede hacer un administrador?

| Acción | Descripción |
|---|---|
| Crear el pricing de un producto | Asociar un precio base y una moneda a un producto que aún no tiene precio |
| Crear el pricing de un combo | Lo mismo para combos |
| Actualizar el precio base | Cambiar el `unitPrice` en cualquier momento |
| Asignar o cambiar el margen | Vincular un margen existente al pricing |
| Quitar el margen | Desvincularlo sin borrar el pricing |
| Consultar todos los pricings | Ver la lista paginada de precios configurados |
| Buscar el pricing de un producto específico | Buscar por el identificador del producto |
| Eliminar el pricing | Desactivarlo si el producto deja de venderse (el sistema lo guarda pero lo oculta) |
| Simular un precio | Usar el preview con cualquier combinación de valores para ver el resultado antes de guardar |

Solo los administradores y el super administrador pueden crear, modificar o eliminar pricings. Los clientes pueden ver los precios calculados cuando navegan la tienda, pero no acceden a la configuración.

---

## Reglas importantes

- **Cada producto y cada combo puede tener un solo pricing** — el sistema rechaza intentar cargar un segundo precio para el mismo artículo.
- **Sin pricing, el artículo no tiene precio calculable** — si un cliente intenta ver el precio de un producto sin pricing configurado, el sistema devuelve un error.
- **El margen es opcional** — un producto puede venderse con solo el precio base, sin ganancia adicional.
- **No se puede cambiar a qué producto pertenece un pricing** — si se equivocó el producto, hay que eliminar el pricing y crear uno nuevo para el correcto.
- **Los cambios de precio no afectan órdenes ya creadas** — el precio de una orden se fija en el momento de crearla; si el precio base sube después, los pedidos anteriores no cambian.
- **El pricing eliminado no desaparece de la base de datos** — se desactiva (soft delete), lo que permite mantener el historial.

---

## Ejemplos del día a día

> El administrador agrega un producto nuevo "Aceite de oliva 500ml" al catálogo y le carga un precio base de $1.200 en pesos, sin margen por ahora. El producto ya aparece en la tienda con ese precio más los impuestos que correspondan.

> Una semana después, decide agregarle un margen del 18% para cubrir costos de distribución. Edita el pricing del producto y vincula el margen correspondiente. El nuevo precio calculado queda automáticamente disponible en la tienda.

> Antes de hacer un cambio de precio general, el administrador usa el preview para simular: si el precio base fuera $1.500, con un margen del 20% y un IVA del 21%, ¿cuánto quedaría el precio final? El sistema responde sin guardar nada.

> Al lanzar una liquidación, el administrador quita el margen de 15 productos de una categoría editando cada pricing. Los precios bajan inmediatamente en la tienda.

---

## ¿Cómo se conecta con el resto del sistema?

El pricing es la base de todo el cálculo de precios de la plataforma. Cuando un cliente ve un producto en la tienda, el sistema consulta su pricing para combinar el precio base con el margen, los impuestos y el descuento vigente. Ese mismo cálculo se ejecuta al momento de crear un pedido para fijar el precio definitivo.

Los descuentos y cupones se aplican encima del precio ya calculado — el pricing en sí no gestiona descuentos, solo define el precio base y el margen. Los impuestos los gestiona el módulo de taxation, que puede asignar impuestos globales o específicos por producto.
