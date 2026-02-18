import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfilePhoto1768653000000 implements MigrationInterface {
  name = 'AddUserProfilePhoto1768653000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN profile_photo_url TEXT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN profile_photo_url;
    `);
  }
}
