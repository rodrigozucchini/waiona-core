---
name: nestjs-docker-postgres
description: >
  Standardized Docker and PostgreSQL integration for NestJS using docker-compose and TypeORM.
  Load when configuring Docker, docker-compose, PostgreSQL containers, or connecting NestJS to a containerized database.
metadata:
  author: @rodrigozucchini
  version: "1.0"
---

# NestJS Docker + PostgreSQL Skill

Standard configuration and patterns for running PostgreSQL in Docker and connecting it to a NestJS application via TypeORM. Covers local/dev environments only.

---

## When to Use This Skill

Load when the user:
- Creates or modifies `docker-compose.yml` for a NestJS project
- Configures TypeORM DataSource to connect to a Postgres container
- Debugs Docker networking or database connection failures
- Sets up environment variables for a containerized stack

Do NOT load when:
- Using a cloud-managed database without Docker (RDS, Supabase, etc.)
- Using a different ORM (Prisma, Sequelize) — patterns here are TypeORM-specific
- Configuring production deployments

---

## Core Rules

1. **Docker service name as host**: When NestJS runs inside Docker, `host` must be the service name (`postgres`), never `localhost`.
2. **All credentials via env vars**: Never hardcode passwords, secrets, or usernames anywhere.
3. **Named volume always**: PostgreSQL must use a named Docker volume — no volume means data loss on restart.
4. **Never commit `.env`**: Only `.env.example` with placeholder values gets committed.
5. **`synchronize: false`**: Always use migrations. `synchronize: true` can silently drop columns.

---

## Patterns: Do This, Not That

### Pattern 1: Database host inside Docker

**Do this:**
```ts
host: process.env.POSTGRES_HOST  // .env: POSTGRES_HOST=postgres
```
**Not this:**
```ts
host: 'localhost'
```
> Why: `localhost` inside Docker refers to the NestJS container itself, not Postgres. Docker DNS resolves service names automatically.

---

### Pattern 2: TypeORM DataSource

**Do this:**
```ts
export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: ['./src/**/*.entity.ts'],
  migrations: ['./src/database/migrations/*.ts'],
  synchronize: false,
});
```
**Not this:**
```ts
host: 'localhost', password: 'postgres', synchronize: true
```
> Why: Hardcoded credentials leak via git; `synchronize: true` auto-alters tables on startup.

---

### Pattern 3: docker-compose with healthcheck

**Do this:**
```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
```
**Not this:** omitting `volumes` or `healthcheck`.
> Why: Without healthcheck, NestJS can attempt connection before Postgres finishes initializing.

---

### Pattern 4: .env.example

**Do this:**
```env
POSTGRES_HOST=<POSTGRES_HOST>
POSTGRES_PORT=<POSTGRES_PORT>
POSTGRES_DB=<POSTGRES_DB>
POSTGRES_USER=<POSTGRES_USER>
POSTGRES_PASSWORD=<POSTGRES_PASSWORD>
```
**Not this:** real values in `.env.example`.
> Why: Real values get copied as-is and create a false sense of security.

---

## Common Mistakes

- **`localhost` as host inside Docker**: Use the service name (`postgres`) instead.
- **No named volume**: Data is lost on every `docker compose down`.
- **`.env` committed to git**: Add to `.gitignore` before first push. If already tracked: `git rm --cached .env`, then rotate all secrets.
- **`synchronize: true`**: Causes silent schema changes. Always use migrations.
- **NestJS starts before Postgres is ready**: Add `healthcheck` to postgres and `depends_on: condition: service_healthy` to the NestJS service.

---

## Expected Output

Correct project structure:
```
project-root/
├── docker-compose.yml      # postgres service, named volume, healthcheck
├── .env                    # real values — never committed
├── .env.example            # placeholders only — committed
├── .gitignore              # includes .env
└── src/database/
    └── data-source.ts      # reads from env, synchronize: false
```

A correct setup: `docker compose up -d` runs clean, postgres is `healthy`, NestJS connects on first start, no credentials in any committed file.

---

## Edge Cases

| Situation | How to handle it |
|-----------|-----------------|
| Port 5432 already in use | Change to `"5433:5432"` in docker-compose, update `POSTGRES_PORT` in `.env` |
| NestJS local + Postgres in Docker | Set `POSTGRES_HOST=localhost` — Docker exposes the port to the host via `ports` |
| Data lost after `docker compose down` | Confirm named volume is declared at root level of docker-compose.yml |
| Migrations fail on startup | Run `npm run typeorm migration:run` manually to see the full error |

---

## Quick Reference

```bash
docker compose up -d        # start containers
docker compose down         # stop (data persists)
docker compose down -v      # stop + delete volume (data lost)
docker ps                   # check container health
docker logs postgres        # view postgres logs
npm run typeorm migration:run       # run pending migrations
npm run typeorm migration:generate  # generate new migration
```

---
