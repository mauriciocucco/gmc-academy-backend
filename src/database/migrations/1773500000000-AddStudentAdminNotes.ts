import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStudentAdminNotes1773500000000 implements MigrationInterface {
  name = 'AddStudentAdminNotes1773500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "student_admin_notes" (
        "student_id" bigint NOT NULL,
        "content" text NOT NULL,
        "updated_by" bigint NOT NULL,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "student_admin_notes_pkey" PRIMARY KEY ("student_id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "student_admin_notes_updated_by_idx"
      ON "student_admin_notes" ("updated_by")
    `);
    await queryRunner.query(`
      ALTER TABLE "student_admin_notes"
      ADD CONSTRAINT "student_admin_notes_student_id_fkey"
      FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "student_admin_notes"
      ADD CONSTRAINT "student_admin_notes_updated_by_fkey"
      FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "student_admin_notes"
      DROP CONSTRAINT "student_admin_notes_updated_by_fkey"
    `);
    await queryRunner.query(`
      ALTER TABLE "student_admin_notes"
      DROP CONSTRAINT "student_admin_notes_student_id_fkey"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."student_admin_notes_updated_by_idx"
    `);
    await queryRunner.query(`DROP TABLE "student_admin_notes"`);
  }
}
