# Módulo de Autenticación — Guía para el Negocio

## ¿Qué es la autenticación?

La autenticación es el proceso mediante el cual la plataforma Waiona verifica que una persona es quien dice ser. Antes de poder hacer un pedido, ver su cuenta o acceder a cualquier función del sistema, un cliente necesita registrarse y demostrar que es el dueño de esa cuenta.

Este módulo gestiona todo ese proceso: desde el momento en que alguien se registra por primera vez, hasta que inicia sesión o recupera su contraseña olvidada.

---

## ¿Cómo funciona el acceso?

El proceso desde que alguien se registra hasta que puede operar en la plataforma:

```
1. El cliente completa el formulario de registro (nombre, email, contraseña)
   ↓
2. El sistema crea la cuenta y envía un email con un link de activación
   ↓
3. El cliente hace clic en el link del email
   ↓
4. La cuenta queda activa — ya puede iniciar sesión
   ↓
5. El cliente ingresa su email y contraseña
   ↓
6. El sistema le entrega un "pase digital" que lo identifica en cada acción
```

Ese "pase digital" (llamado token de sesión) tiene una validez de 6 días. Pasado ese tiempo, el cliente necesita iniciar sesión nuevamente.

---

## ¿Para qué sirve este módulo?

Es la **puerta de entrada** a toda la plataforma. Sin pasar por este módulo, nadie puede hacer pedidos, ver su historial ni acceder a ninguna función protegida. Para los administradores, garantiza que solo el personal autorizado pueda gestionar productos, precios y operaciones del negocio.

---

## Cuándo se usa en el negocio

| Situación | Ejemplo de uso |
|---|---|
| Un cliente nuevo quiere comprar | Se registra con su email y espera el link de activación |
| Un cliente activa su cuenta | Hace clic en el link del email que recibió al registrarse |
| Un cliente inicia sesión | Ingresa email y contraseña para entrar a la plataforma |
| Un cliente olvidó su contraseña | Solicita un link de recuperación y elige una contraseña nueva |
| Un administrador accede al panel | Usa sus credenciales para ingresar al sistema de gestión |

---

## ¿Qué puede hacer cada uno?

| Acción | Quién puede hacerlo |
|---|---|
| Registrarse | Cualquier persona (sin cuenta previa) |
| Activar su cuenta | Quien recibe el email de activación |
| Iniciar sesión | Cualquier persona con cuenta activa |
| Solicitar recuperación de contraseña | Cualquier persona registrada |
| Resetear contraseña | Quien recibe el email de reset |

> Ninguna de estas acciones requiere estar previamente autenticado — son las puertas de entrada al sistema.

---

## Reglas importantes

- **La cuenta debe estar activa para poder ingresar** — si no se hizo clic en el link de activación, el sistema rechaza el inicio de sesión.
- **El link de activación vence en 24 horas** — si no se usa a tiempo, hay que registrarse nuevamente.
- **El link de recuperación de contraseña vence en 1 hora** — es de corta duración por seguridad.
- **El sistema no confirma si un email existe al recuperar contraseña** — siempre responde "si el email existe, recibirás un link", para no dar pistas a personas malintencionadas.
- **Solo puede haber un link de reset activo a la vez** — cuando se solicita uno nuevo, el anterior queda anulado automáticamente.
- **La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número** — el sistema la rechaza si no cumple estos requisitos.
- **El inicio de sesión tiene límite de intentos** — si se realizan demasiados intentos seguidos, el sistema bloquea temporalmente para prevenir ataques.

---

## Ejemplos del día a día

**Un cliente nuevo se registra:**
> Lucía entra al sitio y completa el formulario con su nombre, email y una contraseña. El sistema le avisa que revise su correo. Lucía abre el email, hace clic en "Activar mi cuenta" y puede iniciar sesión al instante.

**Un cliente olvidó su contraseña:**
> Martín intenta entrar pero no recuerda su contraseña. Hace clic en "Olvidé mi contraseña", ingresa su email y en minutos recibe un correo con un link. Hace clic, elige una nueva contraseña y vuelve a ingresar normalmente.

**Un administrador accede al panel:**
> La administradora Ana ingresa su email y contraseña. El sistema reconoce que tiene rol de administrador y le da acceso completo al panel de gestión de productos, precios y pedidos.

**Un cliente intenta ingresar sin activar su cuenta:**
> Carlos se registró pero no activó su cuenta. Al intentar iniciar sesión, el sistema le indica que las credenciales no son válidas (no distingue si el problema es la contraseña o la activación, por seguridad).

---

## ¿Cómo se conecta con el resto del sistema?

La autenticación es la base sobre la que opera toda la plataforma:

- El módulo de **usuarios** crea y gestiona las cuentas — la autenticación lo usa para validar quién está intentando entrar.
- El módulo de **correos** envía los emails de activación y recuperación de contraseña.
- Todos los demás módulos (**pedidos**, **productos**, **pagos**, etc.) requieren que el cliente esté autenticado para operar — el token de sesión emitido por este módulo es el que abre esas puertas.

Sin autenticación no hay sesiones, sin sesiones no hay pedidos.
