import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMaterialLinkLabel1768654000000 implements MigrationInterface {
  name = 'AddMaterialLinkLabel1768654000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE material_links ADD COLUMN label TEXT NULL;
    `);

    await queryRunner.query(`
      UPDATE material_links
      SET label = CASE source_type
        WHEN 'drive' THEN 'Drive material'
        WHEN 'youtube' THEN 'Video material'
        ELSE 'External resource'
      END
      WHERE label IS NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE material_links ALTER COLUMN label SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE material_links DROP COLUMN label;
    `);
  }
}
