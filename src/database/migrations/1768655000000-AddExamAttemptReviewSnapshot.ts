import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExamAttemptReviewSnapshot1768655000000
  implements MigrationInterface
{
  name = 'AddExamAttemptReviewSnapshot1768655000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE exam_attempts ADD COLUMN review_json JSONB NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE exam_attempts DROP COLUMN review_json;
    `);
  }
}
