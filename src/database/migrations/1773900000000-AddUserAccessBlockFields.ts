import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAccessBlockFields1773900000000
  implements MigrationInterface
{
  name = 'AddUserAccessBlockFields1773900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN blocked_at TIMESTAMPTZ NULL,
      ADD COLUMN blocked_by_user_id BIGINT NULL,
      ADD COLUMN block_reason TEXT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE users
      ADD CONSTRAINT users_blocked_by_user_id_fkey
      FOREIGN KEY (blocked_by_user_id)
      REFERENCES users(id)
      ON DELETE SET NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX users_blocked_at_idx
      ON users (blocked_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS users_blocked_at_idx;
    `);

    await queryRunner.query(`
      ALTER TABLE users
      DROP CONSTRAINT IF EXISTS users_blocked_by_user_id_fkey;
    `);

    await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS block_reason,
      DROP COLUMN IF EXISTS blocked_by_user_id,
      DROP COLUMN IF EXISTS blocked_at;
    `);
  }
}
