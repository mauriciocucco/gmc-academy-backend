import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStudentMaterialAssignments1773459318355 implements MigrationInterface {
  name = 'AddStudentMaterialAssignments1773459318355';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "student_material_assignments" (
        "id" BIGSERIAL NOT NULL,
        "student_id" bigint NOT NULL,
        "material_id" bigint NOT NULL,
        "position" integer NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "student_material_assignments_pkey" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "student_material_assignments_student_idx"
      ON "student_material_assignments" ("student_id")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "student_material_assignments_student_position_unique_idx"
      ON "student_material_assignments" ("student_id", "position")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "student_material_assignments_student_material_unique_idx"
      ON "student_material_assignments" ("student_id", "material_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "student_material_assignments"
      ADD CONSTRAINT "student_material_assignments_student_id_fkey"
      FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "student_material_assignments"
      ADD CONSTRAINT "student_material_assignments_material_id_fkey"
      FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      INSERT INTO "student_material_assignments" ("student_id", "material_id", "position")
      SELECT
        access.student_id,
        access.material_id,
        ROW_NUMBER() OVER (
          PARTITION BY access.student_id
          ORDER BY access.enabled_at NULLS LAST, access.material_id
        ) - 1
      FROM "student_material_access" access
      WHERE access.enabled = true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "student_material_assignments"
      DROP CONSTRAINT "student_material_assignments_material_id_fkey"
    `);
    await queryRunner.query(`
      ALTER TABLE "student_material_assignments"
      DROP CONSTRAINT "student_material_assignments_student_id_fkey"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."student_material_assignments_student_material_unique_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."student_material_assignments_student_position_unique_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."student_material_assignments_student_idx"
    `);
    await queryRunner.query(`DROP TABLE "student_material_assignments"`);
  }
}
