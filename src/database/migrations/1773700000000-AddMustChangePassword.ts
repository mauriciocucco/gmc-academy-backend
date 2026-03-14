import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMustChangePassword1773700000000 implements MigrationInterface {
  name = 'AddMustChangePassword1773700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT false;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS must_change_password;
    `);
  }
}
