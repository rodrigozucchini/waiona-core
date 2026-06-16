import { MigrationInterface, QueryRunner } from 'typeorm';

export class CategoriesPartialUniqueIndex1781800000000 implements MigrationInterface {
  name = 'CategoriesPartialUniqueIndex1781800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Constraint creado en InitialSchema1780281702444 vía @Column({ unique: true })
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_categories_name_active" ON "categories" ("name") WHERE "deletedAt" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_categories_name_active"`,
    );

    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`,
    );
  }
}
