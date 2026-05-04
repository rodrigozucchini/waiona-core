# Waiona — Agents

Este directorio define las skills disponibles para IAs (Claude, Cursor, Copilot, etc.) que trabajen en este proyecto.

---

## Cómo usar las skills

Antes de generar código, la IA debe cargar la skill relevante. Cada skill tiene un `When to Use` que indica cuándo cargarla.

**Combinaciones frecuentes:**
- Crear un módulo nuevo → `nestjs-core` + `typeorm-standard`
- Implementar auth o guards → `nestjs-auth-jwt`
- Escribir tests → `nestjs-core` (sección testing)
- Configurar Docker/DB → `nestjs-docker-postgres` + `postgres-standard`
- Agregar migración → `postgres-standard`

---

## Skills disponibles

| Skill | Archivo | Cuándo cargar |
|---|---|---|
| `nestjs-core` | `skills/nestjs-core/SKILL.md` | Crear módulos, controllers, services, entidades |
| `nestjs-auth-jwt` | `skills/nestjs-auth-jwt/SKILL.md` | Auth, guards, JWT, roles |
| `typeorm-standard` | `skills/typeorm-standard/SKILL.md` | Entidades, DTOs, relaciones, transacciones |
| `postgres-standard` | `skills/postgres-standard/SKILL.md` | Migraciones, naming SQL, schema |
| `nestjs-docker-postgres` | `skills/nestjs-docker-postgres/SKILL.md` | Docker, docker-compose, conexión DB |

---

## Contexto del proyecto

Ver `CLAUDE.md` en la raíz del proyecto para el contexto completo — stack, módulos, flujos y convenciones.