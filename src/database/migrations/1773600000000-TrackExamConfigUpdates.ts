import { MigrationInterface, QueryRunner } from 'typeorm';

export class TrackExamConfigUpdates1773600000000
  implements MigrationInterface
{
  name = 'TrackExamConfigUpdates1773600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "exams"
      ADD COLUMN "updated_by" bigint NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "exams"
      ADD COLUMN "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    `);
    await queryRunner.query(`
      CREATE INDEX "exams_updated_by_idx"
      ON "exams" ("updated_by")
    `);
    await queryRunner.query(`
      ALTER TABLE "exams"
      ADD CONSTRAINT "exams_updated_by_fkey"
      FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      UPDATE "exams"
      SET "updated_at" = "created_at"
    `);
    await queryRunner.query(`
      UPDATE "exams"
      SET "updated_by" = admin_user.id
      FROM (
        SELECT id
        FROM "users"
        WHERE "role" = 'admin'
        ORDER BY "id" ASC
        LIMIT 1
      ) admin_user
      WHERE "updated_by" IS NULL
    `);
    await queryRunner.query(`
      UPDATE "exams"
      SET "pass_score" = 1
      WHERE "pass_score" < 1
    `);
    await queryRunner.query(`
      ALTER TABLE "exams"
      DROP CONSTRAINT "exams_pass_score_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "exams"
      ADD CONSTRAINT "exams_pass_score_check"
      CHECK ("pass_score" >= 1 AND "pass_score" <= 100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "exams"
      DROP CONSTRAINT "exams_pass_score_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "exams"
      ADD CONSTRAINT "exams_pass_score_check"
      CHECK ("pass_score" >= 0 AND "pass_score" <= 100)
    `);
    await queryRunner.query(`
      ALTER TABLE "exams"
      DROP CONSTRAINT "exams_updated_by_fkey"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."exams_updated_by_idx"
    `);
    await queryRunner.query(`
      ALTER TABLE "exams"
      DROP COLUMN "updated_at"
    `);
    await queryRunner.query(`
      ALTER TABLE "exams"
      DROP COLUMN "updated_by"
    `);
  }
}
