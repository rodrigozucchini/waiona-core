# Auth — Análisis Técnico Completo

## ¿Qué es el módulo auth?

El módulo de autenticación gestiona el ciclo de vida de la sesión en Waiona: registro, activación por email, login con JWT, recuperación y reset de contraseña. No tiene entidad propia — opera sobre `UserEntity` (del módulo `users`) y `TokenEntity` (del módulo `mail`). Es el único punto de entrada para obtener un JWT válido que el resto de los módulos protegidos requieren.

```
POST /auth/register    → crea UserEntity inactivo + envía token de activación
GET  /auth/activate    → valida token → isActive = true
POST /auth/login       → valida credenciales → emite JWT { sub, role }
                                ↓
                   Authorization: Bearer <jwt>  ← requerido por todos los módulos protegidos

POST /auth/forgot-password → invalida tokens previos + envía token de reset
POST /auth/reset-password  → valida token → actualiza password
```

---

## Cuándo se usa en el negocio

| Escenario | Ejemplo |
|---|---|
| Registro de cliente nuevo | El cliente completa el formulario y recibe un email para activar la cuenta |
| Activación de cuenta | El cliente hace clic en el link del email para habilitar el login |
| Login | El cliente ingresa email y contraseña y obtiene un JWT para operar |
| Recuperación de contraseña | El cliente solicita un link de reset por email |
| Reset de contraseña | El cliente ingresa el token del email y elige una nueva contraseña |

---

## Tipos de datos

### Modelo de payload JWT (`Payload`)

```typescript
{
  sub:  number;        // userId — identifica al usuario en req.user
  role: RoleType | null; // 'super_admin' | 'admin' | 'client' — leído por RolesGuard sin query a DB
}
```

### Entidad token (`TokenEntity`) — compartida con módulo `mail`

```typescript
{
  id:        number;
  token:     string;          // randomBytes(32).toString('hex') — 64 chars hex, único en la tabla
  type:      TokenType;       // 'account_activation' | 'password_reset'
  userId:    number;          // FK a users.id — CASCADE al eliminar el usuario
  expiresAt: Date;            // timestamptz — activación: +24h, reset: +1h
  usedAt:    Date | null;     // timestamptz — null = no usado aún
  // computed getters:
  isExpired: boolean;         // new Date() > expiresAt
  isUsed:    boolean;         // usedAt !== null
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Request: registrar (`CreateUserDto`)

```typescript
{
  email:    string;   // requerido, formato email
  password: string;   // requerido, 8–255 chars — debe tener mayúscula + minúscula + número
  name:     string;   // requerido, máx 255 chars
  lastName: string;   // requerido, máx 255 chars
  avatar?:  string;   // opcional, URL válida, máx 255 chars
}
```

### Request: login

Passport LocalStrategy extrae `email` y `password` del body directamente. No hay DTO explícito.

```typescript
{
  email:    string;
  password: string;
}
```

### Response: login

```typescript
{
  user: {
    id:        number;
    email:     string;
    isActive:  boolean;
    role:      'super_admin' | 'admin' | 'client' | null;
    profile: {
      id:       number;
      name:     string;
      lastName: string;
      avatar:   string | null;
    };
    createdAt: Date;
    updatedAt: Date;
    // password: NUNCA expuesto — @Exclude() en UserEntity + ClassSerializerInterceptor global
  };
  access_token: string; // JWT firmado con JWT_SECRET, expira en 6 días
}
```

### Request: forgot-password (`ForgotPasswordDto`)

```typescript
{
  email: string; // requerido, formato email
}
```

### Request: reset-password (`ResetPasswordDto`)

```typescript
{
  token:    string; // requerido — el token del email
  password: string; // requerido, 8–100 chars
}
```

---

## Endpoints

### `POST /auth/register`

Crea un usuario inactivo y envía un email de activación.

**Request:**
```json
{
  "email": "juan@example.com",
  "password": "Password123",
  "name": "Juan",
  "lastName": "Pérez"
}
```

**Response 201:**
```json
{ "message": "Registration successful — check your email to activate your account" }
```

**Errores posibles:**
- `400` — datos inválidos (email mal formateado, password sin mayúscula, campos faltantes)
- `409` — el email ya está registrado

> Throttle: máx 5 requests por minuto por IP.

---

### `GET /auth/activate?token=xxx`

Activa la cuenta usando el token recibido por email.

**Response 200:**
```json
{ "message": "Account activated successfully" }
```

**Errores posibles:**
- `400` — token no existe, ya fue usado, o está expirado (mensaje genérico, no distingue el caso)
- `400` — la cuenta ya estaba activada

---

### `POST /auth/login`

Valida credenciales y emite un JWT. Gestionado por `AuthGuard('local')` → `LocalStrategy` → `AuthService.validateUser()`.

**Request:**
```json
{
  "email": "juan@example.com",
  "password": "Password123"
}
```

**Response 200:**
```json
{
  "user": {
    "id": 1,
    "email": "juan@example.com",
    "isActive": true,
    "role": "client",
    "profile": {
      "id": 1,
      "name": "Juan",
      "lastName": "Pérez",
      "avatar": null
    },
    "createdAt": "2026-05-19T10:00:00.000Z",
    "updatedAt": "2026-05-19T10:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores posibles:**
- `401` — email no existe, password incorrecta, o cuenta no activada (mensaje genérico `"Invalid credentials"`)

> Throttle: máx 5 requests por minuto por IP.

---

### `POST /auth/forgot-password`

Envía un email con link de reset de contraseña. Invalida todos los tokens de reset previos del usuario antes de crear uno nuevo.

**Request:**
```json
{ "email": "juan@example.com" }
```

**Response 200:**
```json
{ "message": "If the email exists, you will receive a reset link shortly" }
```

> Siempre responde 200 — no revela si el email existe o no (previene enumeración de usuarios). El email solo se envía si la cuenta existe **y** está activa.

> Throttle: máx 3 requests por minuto por IP.

---

### `POST /auth/reset-password`

Valida el token de reset e invalida todos los tokens de reset del usuario.

**Request:**
```json
{
  "token": "a3f8c2...",
  "password": "NuevoPassword123"
}
```

**Response 200:**
```json
{ "message": "Password reset successfully" }
```

**Errores posibles:**
- `400` — token no existe, ya fue usado, o está expirado

> Throttle: máx 5 requests por minuto por IP.

---

## Reglas de negocio

| Regla | Dónde se aplica |
|---|---|
| Token de activación expira en 24 horas | `createToken()` con `expiresInHours: 24` |
| Token de reset expira en 1 hora | `createToken()` con `expiresInHours: 1` |
| Token marcado como usado tras consumirse | `activateAccount` y `findValidToken` → `tokenEntity.usedAt = new Date()` |
| Tokens de reset previos invalidados al solicitar nuevo | `forgotPassword` → `tokenRepo.update({ userId, type: PASSWORD_RESET }, { usedAt })` antes de crear el nuevo |
| `forgotPassword` silencioso si email no existe o cuenta inactiva | early return sin enviar email ni error |
| Login rechazado si `isActive === false` | `validateUser` → `401 UnauthorizedException` |
| `password` jamás expuesto en respuestas | `@Exclude()` en `UserEntity` + `ClassSerializerInterceptor` global en `main.ts` |
| JWT expira en 6 días | `JwtModule` con `signOptions: { expiresIn: '6d' }` |
| `RolesGuard` lee rol del JWT — sin query a DB | `JwtStrategy.validate()` retorna el payload completo |

---

## Ejemplos de uso real

**Flujo completo de registro y primer login:**
```
POST /auth/register   { email, password, name, lastName }  → 201
GET  /auth/activate?token=<token-del-email>                → 200
POST /auth/login      { email, password }                  → 200 + JWT
```

**Flujo de reset de contraseña:**
```
POST /auth/forgot-password  { email }                            → 200
POST /auth/reset-password   { token: <token-del-email>, password } → 200
POST /auth/login            { email, nuevaPassword }             → 200 + JWT
```

**Usar el JWT en rutas protegidas:**
```
GET /users/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
→ 200
```

---

## Cumplimiento con agent skills

| Check | Estado |
|---|---|
| Dos estrategias: `local` solo para login, `jwt` para rutas protegidas | ✅ |
| JWT payload incluye `role` — sin query a DB en `RolesGuard` | ✅ |
| `JwtStrategy.validate()` retorna payload completo | ✅ |
| `JWT_SECRET` via `ConfigService<Env>` — nunca `process.env` | ✅ |
| `validateUser()` verifica `isActive` → 401 | ✅ |
| `forgotPassword` no revela existencia del email | ✅ |
| Token generado con `randomBytes(32)` | ✅ |
| Throttle en todos los endpoints sensibles | ✅ register / login / forgot-password / reset-password |
| `ClassSerializerInterceptor` global en `main.ts` — sin redundancia en controller | ✅ |
| Swagger — `@ApiTags`, `@ApiOperation`, `@ApiResponse` en los 5 endpoints | ✅ |
| Tipo de retorno explícito en `login` | ✅ `{ user: UserEntity; access_token: string }` |
| Unit tests | ✅ 23 casos — service (18) + controller (5) |
| E2E tests — PostgreSQL real, `dropSchema: true`, 13 casos | ✅ |

---

## Tests

### Unit tests (`src/modules/auth/`)

```bash
npx jest --testPathPattern="src/modules/auth" --no-coverage
```

| Suite | Tests | Cobertura |
|---|---|---|
| `auth.service.spec.ts` | 18 | validateUser (4), generateToken (1), register (1), activateAccount (4), forgotPassword (3), resetPassword (2), defined (1) |
| `auth.controller.spec.ts` | 5 | register, activate, login, forgotPassword, resetPassword — happy path + delegación al service |

### E2E tests (`test/auth/auth.e2e-spec.ts`)

```bash
docker compose up -d
npx jest --config test/jest-e2e.json --testPathPattern="auth"
```

| Caso | Status esperado |
|---|---|
| POST /auth/register con datos válidos | 201 |
| POST /auth/register email duplicado | 409 |
| POST /auth/register body inválido | 400 |
| POST /auth/login cuenta no activada | 401 |
| GET /auth/activate token válido | 200 |
| GET /auth/activate token ya usado | 400 |
| GET /auth/activate token inválido | 400 |
| POST /auth/login credenciales correctas — 200 + sin password en respuesta | 200 |
| POST /auth/login password incorrecta | 401 |
| POST /auth/forgot-password email inexistente — sin email enviado | 200 |
| POST /auth/forgot-password email válido — envía email | 200 |
| POST /auth/reset-password token válido + login con nueva contraseña | 200 → 200 |
| POST /auth/reset-password token inválido | 400 |

---

## Integración con otros módulos

```
AuthModule
  ├── consume UsersService
  │     ├── create()          → POST /auth/register
  │     ├── findByEmail()     → validateUser (login)
  │     ├── findOne()         → activateAccount (verifica isActive)
  │     ├── activate()        → GET /auth/activate
  │     └── updatePassword()  → POST /auth/reset-password
  │
  ├── consume MailService
  │     ├── sendActivationEmail()    → POST /auth/register
  │     └── sendPasswordResetEmail() → POST /auth/forgot-password
  │
  └── consume TokenEntity (repo directo — no via MailModule service)
        ├── createToken()     → genera y persiste token
        └── findValidToken()  → valida token en activate y reset

JwtStrategy (jwt)
  └── emitido por AuthModule → validado en TODOS los módulos con AuthGuard('jwt')
        └── req.user = { sub: userId, role: RoleType } — disponible en cualquier controller protegido
```
