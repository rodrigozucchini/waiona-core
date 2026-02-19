---
name: postgres-standard
description: >
  PostgreSQL conventions for schema design, naming, constraints, seed data, and migrations in this repo.
  Load when creating entities, writing SQL scripts, planning migrations, or reviewing schema consistency.
metadata:
  author: @rodrigozucchini
  version: "1.0"
---

# PostgreSQL Standard Skill

Defines naming conventions, schema rules, and migration patterns for all database changes in this project. Every schema change goes through TypeORM migrations — no exceptions.

---

## When to Use This Skill

Load when the user:
- Creates or modifies a TypeORM entity
- Writes a migration (additive or destructive)
- Writes seed data or SQL fix scripts
- Reviews column naming, constraints, or data integrity

Do NOT load when:
- Only configuring the TypeORM DataSource connection (use `nestjs-docker-postgres` skill)
- Writing application logic unrelated to schema

---

## Core Rules

1. **Incremental migrations only**: Every schema change is a focused migration file — never batch unrelated changes together.
2. **BaseEntity fields are mandatory**: All tables must have `id`, `createdAt`, `updatedAt`, `isDeleted` — never omit them.
3. **Column names match entity fields exactly**: If the entity field is `avatarUrl`, the SQL column is `"avatarUrl"` (camelCase, quoted).
4. **Enums come from `src/common/enums`**: Never hardcode enum values in migrations or entities — always import from the shared enum file.
5. **`synchronize: false` always**: Schema changes only happen through migration files, never auto-sync.

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Table names | snake_case, plural | `persons`, `product_variants` |
| Column names | camelCase, quoted in SQL | `"avatarUrl"`, `"basePrice"` |
| Migration file | `{timestamp}-{description}.ts` | `1769550000000-add-avatar-url-to-persons.ts` |
| Enum columns | match `src/common/enums` exactly | `ProductType`, `MeasureUnit` |
| FK columns | `{relation}Id` camelCase | `categoryId`, `marginId` |

---

## Patterns: Do This, Not That

### Pattern 1: Additive migration (nullable column)

**Do this:**
```sql
ALTER TABLE "persons" ADD "avatarUrl" character varying(255);
```

**Not this:**
```sql
ALTER TABLE persons ADD avatarUrl VARCHAR(255) NOT NULL DEFAULT '';
```
> Why: Column names must be quoted (camelCase). New columns should be nullable — use a follow-up migration to add NOT NULL once data is backfilled.

---

### Pattern 2: Safe rollback (down migration)

**Do this:**
```sql
ALTER TABLE "persons" DROP COLUMN "avatarUrl";
```
> Every migration must have a working `down()` method. Never leave it empty.

---

### Pattern 3: Enum column

**Do this:**
```typescript
import { ProductType } from '../../../common/enums/product-type.enum';

@Column({ type: 'enum', enum: ProductType })
type: ProductType;
```

**Not this:**
```typescript
@Column({ type: 'enum', enum: ['physical', 'digital', 'service'] })
type: string;
```
> Why: Hardcoded enum values drift from the source of truth in `src/common/enums`.

---

### Pattern 4: BaseEntity fields

Every entity must extend or include:
```typescript
@PrimaryGeneratedColumn()
id: number;

@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;

@Column({ default: false })
isDeleted: boolean;
```

---

## Common Mistakes

- **Adding NOT NULL column without default**: Fails on existing rows. Always add nullable first, backfill, then add constraint.
- **Skipping `down()` in migration**: Makes rollbacks impossible. Always implement it.
- **Unquoted camelCase column names in SQL**: PostgreSQL lowercases unquoted identifiers. Always quote `"camelCaseColumns"`.
- **Enum values not matching `src/common/enums`**: Causes runtime errors on insert. Always import the enum.
- **Batching unrelated changes in one migration**: Hard to roll back safely. One concern per migration file.

---

## Expected Output

A correct additive migration looks like this:

```typescript
export class AddAvatarUrlToPersons1769550000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "persons" ADD "avatarUrl" character varying(255)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "persons" DROP COLUMN "avatarUrl"`
    );
  }
}
```

Key characteristics:
- Timestamp in class name matches filename
- `up()` and `down()` both implemented
- Column name quoted and camelCase
- Single focused change

---

## Edge Cases

| Situation | How to handle it |
|-----------|-----------------|
| Adding NOT NULL column to existing table | Add nullable → backfill data → add NOT NULL in separate migration |
| Renaming a column | Add new column → copy data → drop old column (3 migrations or 1 careful one with data script) |
| Enum value added to existing enum | Add value to `src/common/enums` file first, then alter the DB enum type in migration |
| Migration fails halfway | Fix the issue, run `migrations:revert`, then re-run — never manually edit the DB |

---

## Quick Reference

```bash
npm run migrations:generate   # auto-generate migration from entity diff
npm run migrations:show       # list pending migrations
npm run migrations:run        # apply pending migrations
npm run migrations:revert     # rollback last migration
```

---
