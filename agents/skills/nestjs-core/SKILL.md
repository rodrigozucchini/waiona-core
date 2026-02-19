---
name: nestjs-core
description: >
  NestJS core conventions for this repo: module structure, controllers, services, global config, and entity patterns.
  Load when creating modules, controllers, services, or configuring the app bootstrap.
metadata:
  author: @rodrigozucchini
  version: "1.0"
---

# NestJS Core Skill

Defines the structural conventions, patterns, and rules for all NestJS modules in this project. Based on the actual codebase. Works alongside `nestjs-auth-jwt` (auth/guards) and `typeorm-standard` (entities/DTOs).

---

## When to Use This Skill

Load when the user:
- Creates a new module, controller, or service
- Configures `main.ts` or `app.module.ts`
- Defines a new entity or relationship
- Implements soft delete, findAll, findOne, or update patterns

Do NOT load when:
- Setting up Docker or database connection (use `nestjs-docker-postgres`)
- Implementing auth, guards, or JWT (use `nestjs-auth-jwt`)
- Writing migrations (use `postgres-standard`)

---

## Core Rules

1. **Modules split by context**: Admin and client logic live in separate controllers and services (`{module}/admin/` and `{module}/client/`).
2. **All entities extend `BaseEntity`**: Every entity gets `id`, `createdAt`, `updatedAt`, `isDeleted` for free.
3. **Soft delete only**: Never use hard delete. Always set `isDeleted = true` and save.
4. **All queries filter `isDeleted: false`**: Every `find` and `findOne` must include this condition.
5. **Relations resolved in service via helper methods**: Never inline relation lookups in `create` or `update` — use private `resolve{Relation}()` methods.
6. **`ParseIntPipe` on all ID params**: Every `:id` route param uses `@Param('id', ParseIntPipe)`.

---

## Project Structure

```
src/
├── main.ts                        # Bootstrap: GlobalPipe, GlobalInterceptor, PORT
├── app.module.ts                  # Root module: ConfigModule, TypeOrmModule, all modules
├── env.model.ts                   # Env interface (typed ConfigService)
├── common/
│   ├── entities/
│   │   ├── base.entity.ts         # id, createdAt, updatedAt, isDeleted
│   │   └── person.entity.ts       # Shared person data
│   └── enums/                     # All enums live here
└── {module}/
    ├── {module}.module.ts         # Module declaration
    ├── entities/
    │   └── {module}.entity.ts
    ├── admin/
    │   ├── {module}.admin.controller.ts
    │   ├── {module}.admin.service.ts
    │   ├── {module}.admin.module.ts
    │   └── dto/
    │       ├── create-{module}.admin.dto.ts
    │       ├── update-{module}.admin.dto.ts
    │       └── {module}-response.admin.dto.ts
    └── client/
        ├── {module}.client.controller.ts
        ├── {module}.client.service.ts
        └── dto/
```

---

## Patterns: Do This, Not That

### Pattern 1: main.ts bootstrap

**Do this:**
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await app.listen(process.env.PORT ?? 3000);
}
```
> Always include `whitelist`, `forbidNonWhitelisted`, `transform`, and `ClassSerializerInterceptor`. Never remove these — they enforce DTO validation and `@Exclude()` on sensitive fields.

---

### Pattern 2: Controller structure

**Do this:**
```typescript
@UseGuards(AuthGuard('jwt'))
@Controller('admin/products')
export class ProductsAdminController {
  constructor(private readonly productsService: ProductsAdminService) {}

  @Post()
  create(@Body() dto: CreateProductAdminDto) {
    return this.productsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductAdminDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
```
**Not this:** missing `ParseIntPipe`, missing `@UseGuards`, or mixing admin/client routes in the same controller.

---

### Pattern 3: Soft delete

**Do this:**
```typescript
async remove(id: number) {
  const entity = await this.findOne(id);
  entity.isDeleted = true;
  return this.repository.save(entity);
}
```
**Not this:**
```typescript
await this.repository.delete(id);
```
> Hard deletes are never used. All removals set `isDeleted = true`.

---

### Pattern 4: findAll and findOne always filter isDeleted

**Do this:**
```typescript
findAll() {
  return this.repository.find({ where: { isDeleted: false } });
}

async findOne(id: number) {
  const entity = await this.repository.findOne({ where: { id, isDeleted: false } });
  if (!entity) throw new NotFoundException('Entity not found');
  return entity;
}
```
**Not this:**
```typescript
return this.repository.find();
return this.repository.findOneBy({ id });
```

---

### Pattern 5: Resolve relations with private helpers

**Do this:**
```typescript
async create(dto: CreateProductAdminDto) {
  const product = this.productRepository.create({
    ...dto,
    margin: dto.marginId ? await this.resolveMargin(dto.marginId) : null,
    taxes: dto.taxIds?.length ? await this.resolveTaxes(dto.taxIds) : [],
  });
  return this.productRepository.save(product);
}

private async resolveMargin(marginId: number): Promise<MarginEntity> {
  const margin = await this.marginRepository.findOneBy({ id: marginId, isDeleted: false });
  if (!margin) throw new NotFoundException(`Margin ${marginId} not found`);
  return margin;
}

private async resolveTaxes(taxIds: number[]): Promise<TaxEntity[]> {
  const taxes = await this.taxRepository.find({ where: { id: In(taxIds), isDeleted: false } });
  if (taxes.length !== taxIds.length) throw new NotFoundException('One or more taxes not found');
  return taxes;
}
```
**Not this:** inlining repository calls directly inside `create()` or `update()`.

---

### Pattern 6: Update with partial DTO

**Do this:**
```typescript
async update(id: number, dto: UpdateProductAdminDto) {
  const entity = await this.findOne(id);
  Object.assign(entity, {
    name: dto.name ?? entity.name,
    description: dto.description ?? entity.description,
  });
  return this.repository.save(entity);
}
```
> Always use `?? entity.field` to preserve existing values when a field is not sent.

---

### Pattern 7: Entity sections

Entities use section comments matching DTO sections:
```typescript
@Entity('products')
export class ProductEntity extends BaseEntity {
  // ==========================
  // Datos básicos
  // ==========================

  // ==========================
  // Relaciones
  // ==========================
}
```

---

## BaseEntity Reference

All entities must extend this:
```typescript
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
```

---

## app.module.ts Pattern

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env>) => ({
        type: 'postgres',
        host: config.get('POSTGRES_HOST', { infer: true }),
        port: config.get('POSTGRES_PORT', { infer: true }),
        username: config.get('POSTGRES_USER', { infer: true }),
        password: config.get('POSTGRES_PASSWORD', { infer: true }),
        database: config.get('POSTGRES_DB', { infer: true }),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    // modules...
  ],
})
export class AppModule {}
```

---

## env.model.ts Pattern

Always type the env with an interface and use `ConfigService<Env>`:
```typescript
export interface Env {
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_DB: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  JWT_SECRET: string;
}
```

---

## Common Mistakes

- **Missing `isDeleted: false` in queries**: Soft-deleted records appear in results.
- **Using `findOneBy` without `isDeleted`**: Always use `findOne({ where: { id, isDeleted: false } })`.
- **Hard deleting**: Never call `.delete()` or `.remove()` directly on the repository.
- **Missing `ParseIntPipe` on ID params**: Allows string IDs to reach the service.
- **Mixing admin and client in the same controller**: Keep them separated — different guards, different response shapes.
- **Inlining relation resolution**: Makes `create()` and `update()` hard to read and test.

---

## Edge Cases

| Situation | How to handle it |
|-----------|-----------------|
| Array relation partially not found | Count resolved vs requested IDs and throw `NotFoundException` if mismatch (see `resolveTaxes` pattern) |
| Nullable relation in update | Check `dto.field !== undefined` before reassigning — `null` is a valid value to clear a relation |
| `@Exclude()` not working on response | Confirm `ClassSerializerInterceptor` is registered globally in `main.ts` |
| New env variable needed | Add to `Env` interface in `env.model.ts` first, then use via typed `ConfigService<Env>` |

---

