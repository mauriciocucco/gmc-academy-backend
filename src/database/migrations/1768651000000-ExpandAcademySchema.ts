import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandAcademySchema1768651000000 implements MigrationInterface {
  name = 'ExpandAcademySchema1768651000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users ADD COLUMN phone TEXT NULL;`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique_idx ON users (phone) WHERE phone IS NOT NULL;
    `);

    await queryRunner.query(`
      CREATE TABLE material_categories (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        key TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX material_categories_key_unique_idx ON material_categories (key);
    `);
    await queryRunner.query(`
      INSERT INTO material_categories (key, name)
      VALUES
        ('theory', 'Theory'),
        ('signs', 'Signs'),
        ('mock', 'Mock');
    `);

    await queryRunner.query(`
      ALTER TABLE materials ADD COLUMN category_id BIGINT NULL;
    `);
    await queryRunner.query(`
      UPDATE materials m
      SET category_id = c.id
      FROM material_categories c
      WHERE c.key = CASE m.category
        WHEN 'teoria' THEN 'theory'
        WHEN 'senales' THEN 'signs'
        WHEN 'simulacro' THEN 'mock'
        ELSE 'theory'
      END;
    `);
    await queryRunner.query(`
      ALTER TABLE materials ALTER COLUMN category_id SET NOT NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE materials
      ADD CONSTRAINT materials_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES material_categories(id) ON DELETE RESTRICT;
    `);
    await queryRunner.query(`
      CREATE INDEX materials_category_id_idx ON materials (category_id);
    `);

    await queryRunner.query(`
      CREATE TABLE material_links (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        material_id BIGINT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
        source_type TEXT NOT NULL CHECK (source_type IN ('drive', 'youtube', 'other')),
        url TEXT NOT NULL,
        position INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE INDEX material_links_material_id_idx ON material_links (material_id);
    `);
    await queryRunner.query(`
      CREATE INDEX material_links_material_position_idx ON material_links (material_id, position);
    `);
    await queryRunner.query(`
      INSERT INTO material_links (material_id, source_type, url, position)
      SELECT id, 'drive', drive_url, 0
      FROM materials
      WHERE drive_url IS NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE materials DROP COLUMN drive_url;
    `);
    await queryRunner.query(`
      ALTER TABLE materials DROP COLUMN category;
    `);

    await queryRunner.query(`
      CREATE TABLE student_material_access (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        material_id BIGINT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
        student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        enabled BOOLEAN NOT NULL DEFAULT false,
        enabled_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
        enabled_at TIMESTAMPTZ NULL
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX student_material_access_material_student_unique_idx
      ON student_material_access (material_id, student_id);
    `);
    await queryRunner.query(`
      CREATE INDEX student_material_access_student_enabled_idx
      ON student_material_access (student_id, enabled);
    `);

    await queryRunner.query(`
      INSERT INTO student_material_access (material_id, student_id, enabled, enabled_by, enabled_at)
      SELECT m.id, u.id, true, m.created_by, now()
      FROM materials m
      INNER JOIN users u ON u.role = 'student'
      WHERE m.published = true;
    `);

    await queryRunner.query(`
      ALTER TABLE certificates RENAME COLUMN pdf_path TO pdf_url;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE certificates RENAME COLUMN pdf_url TO pdf_path;
    `);

    await queryRunner.query(
      `DROP INDEX IF EXISTS student_material_access_student_enabled_idx;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS student_material_access_material_student_unique_idx;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS student_material_access;`);

    await queryRunner.query(
      `ALTER TABLE materials ADD COLUMN category TEXT NULL;`,
    );
    await queryRunner.query(`
      UPDATE materials m
      SET category = CASE c.key
        WHEN 'theory' THEN 'teoria'
        WHEN 'signs' THEN 'senales'
        WHEN 'mock' THEN 'simulacro'
        ELSE 'teoria'
      END
      FROM material_categories c
      WHERE m.category_id = c.id;
    `);
    await queryRunner.query(
      `ALTER TABLE materials ALTER COLUMN category SET NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE materials ADD COLUMN drive_url TEXT NULL;`,
    );
    await queryRunner.query(`
      UPDATE materials m
      SET drive_url = ml.url
      FROM (
        SELECT DISTINCT ON (material_id) material_id, url
        FROM material_links
        WHERE source_type = 'drive'
        ORDER BY material_id, position ASC, id ASC
      ) ml
      WHERE m.id = ml.material_id;
    `);
    await queryRunner.query(
      `ALTER TABLE materials ALTER COLUMN drive_url SET NOT NULL;`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS material_links_material_position_idx;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS material_links_material_id_idx;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS material_links;`);

    await queryRunner.query(
      `ALTER TABLE materials DROP CONSTRAINT IF EXISTS materials_category_id_fkey;`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS materials_category_id_idx;`);
    await queryRunner.query(`ALTER TABLE materials DROP COLUMN category_id;`);

    await queryRunner.query(
      `DROP INDEX IF EXISTS material_categories_key_unique_idx;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS material_categories;`);

    await queryRunner.query(`DROP INDEX IF EXISTS users_phone_unique_idx;`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN phone;`);
  }
}
