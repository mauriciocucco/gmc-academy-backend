import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMaterialViewedAt1768652000000 implements MigrationInterface {
  name = 'AddMaterialViewedAt1768652000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE student_material_access
      ADD COLUMN viewed_at TIMESTAMPTZ NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX student_material_access_student_viewed_idx
      ON student_material_access (student_id, viewed_at)
      WHERE viewed_at IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS student_material_access_student_viewed_idx;
    `);
    await queryRunner.query(`
      ALTER TABLE student_material_access DROP COLUMN viewed_at;
    `);
  }
}
