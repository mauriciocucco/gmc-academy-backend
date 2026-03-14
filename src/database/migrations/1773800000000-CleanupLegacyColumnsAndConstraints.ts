import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanupLegacyColumnsAndConstraints1773800000000 implements MigrationInterface {
  name = 'CleanupLegacyColumnsAndConstraints1773800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Remove legacy columns from student_material_access
    await queryRunner.query(`
      ALTER TABLE "student_material_access"
        DROP CONSTRAINT IF EXISTS "student_material_access_enabled_by_fkey";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "student_material_access_student_enabled_idx";
    `);

    await queryRunner.query(`
      ALTER TABLE "student_material_access"
        DROP COLUMN "enabled",
        DROP COLUMN "enabled_by",
        DROP COLUMN "enabled_at";
    `);

    // 2. Add unique constraint on certificates.student_id
    await queryRunner.query(`
      CREATE UNIQUE INDEX "certificates_student_id_unique_idx"
        ON "certificates" ("student_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 2. Remove unique constraint on certificates.student_id
    await queryRunner.query(`
      DROP INDEX IF EXISTS "certificates_student_id_unique_idx";
    `);

    // 1. Restore legacy columns in student_material_access
    await queryRunner.query(`
      ALTER TABLE "student_material_access"
        ADD COLUMN "enabled" BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN "enabled_by" BIGINT NULL,
        ADD COLUMN "enabled_at" TIMESTAMPTZ NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "student_material_access"
        ADD CONSTRAINT "student_material_access_enabled_by_fkey"
        FOREIGN KEY ("enabled_by") REFERENCES "users"("id") ON DELETE SET NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX "student_material_access_student_enabled_idx"
        ON "student_material_access" ("student_id", "enabled");
    `);
  }
}
