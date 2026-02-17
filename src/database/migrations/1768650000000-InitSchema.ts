import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1768650000000 implements MigrationInterface {
  name = 'InitSchema1768650000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
        refresh_token_hash TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX users_email_unique_idx ON users (LOWER(email));
    `);

    await queryRunner.query(`
      CREATE TABLE materials (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        drive_url TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('teoria', 'senales', 'simulacro')) DEFAULT 'teoria',
        published BOOLEAN NOT NULL DEFAULT true,
        created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE INDEX materials_created_by_idx ON materials (created_by);
    `);
    await queryRunner.query(`
      CREATE INDEX materials_published_idx ON materials (published);
    `);

    await queryRunner.query(`
      CREATE TABLE exams (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        pass_score NUMERIC(5,2) NOT NULL DEFAULT 70 CHECK (pass_score >= 0 AND pass_score <= 100),
        is_active BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE INDEX exams_is_active_idx ON exams (is_active);
    `);

    await queryRunner.query(`
      CREATE TABLE exam_questions (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        options_json JSONB NOT NULL,
        correct_option TEXT NOT NULL,
        position INTEGER NOT NULL
      );
    `);
    await queryRunner.query(`
      CREATE INDEX exam_questions_exam_id_idx ON exam_questions (exam_id);
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX exam_questions_exam_position_unique_idx ON exam_questions (exam_id, position);
    `);

    await queryRunner.query(`
      CREATE TABLE exam_attempts (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
        student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
        passed BOOLEAN NOT NULL,
        answers_json JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE INDEX exam_attempts_exam_id_idx ON exam_attempts (exam_id);
    `);
    await queryRunner.query(`
      CREATE INDEX exam_attempts_student_id_idx ON exam_attempts (student_id);
    `);
    await queryRunner.query(`
      CREATE INDEX exam_attempts_student_created_at_idx ON exam_attempts (student_id, created_at DESC);
    `);

    await queryRunner.query(`
      CREATE TABLE certificates (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        exam_attempt_id BIGINT NOT NULL UNIQUE REFERENCES exam_attempts(id) ON DELETE RESTRICT,
        certificate_code TEXT NOT NULL,
        pdf_path TEXT NULL,
        issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX certificates_certificate_code_unique_idx ON certificates (certificate_code);
    `);
    await queryRunner.query(`
      CREATE INDEX certificates_student_id_idx ON certificates (student_id);
    `);
    await queryRunner.query(`
      CREATE INDEX certificates_exam_attempt_id_idx ON certificates (exam_attempt_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS certificates_exam_attempt_id_idx;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS certificates_student_id_idx;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS certificates_certificate_code_unique_idx;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS certificates;`);

    await queryRunner.query(
      `DROP INDEX IF EXISTS exam_attempts_student_created_at_idx;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS exam_attempts_student_id_idx;`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS exam_attempts_exam_id_idx;`);
    await queryRunner.query(`DROP TABLE IF EXISTS exam_attempts;`);

    await queryRunner.query(
      `DROP INDEX IF EXISTS exam_questions_exam_position_unique_idx;`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS exam_questions_exam_id_idx;`);
    await queryRunner.query(`DROP TABLE IF EXISTS exam_questions;`);

    await queryRunner.query(`DROP INDEX IF EXISTS exams_is_active_idx;`);
    await queryRunner.query(`DROP TABLE IF EXISTS exams;`);

    await queryRunner.query(`DROP INDEX IF EXISTS materials_published_idx;`);
    await queryRunner.query(`DROP INDEX IF EXISTS materials_created_by_idx;`);
    await queryRunner.query(`DROP TABLE IF EXISTS materials;`);

    await queryRunner.query(`DROP INDEX IF EXISTS users_email_unique_idx;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
  }
}
