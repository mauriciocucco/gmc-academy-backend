import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  AdminStudentInsightsRepositoryPort,
  AdminStudentMaterialProgressItem,
  AdminStudentNote,
  SaveAdminStudentNoteInput,
} from '../../domain/ports/admin-student-insights-repository.port';

@Injectable()
export class TypeOrmAdminStudentInsightsRepository implements AdminStudentInsightsRepositoryPort {
  constructor(private readonly dataSource: DataSource) {}

  async findStudentNote(studentId: string): Promise<AdminStudentNote | null> {
    const [row] = await this.dataSource.query<
      Array<{
        content: string;
        updated_at: Date;
        updated_by_name: string;
      }>
    >(
      `
      SELECT
        note.content,
        note.updated_at,
        updater.full_name AS updated_by_name
      FROM student_admin_notes note
      INNER JOIN users updater
        ON updater.id = note.updated_by
      WHERE note.student_id = $1
      `,
      [studentId],
    );

    if (!row) {
      return null;
    }

    return {
      content: row.content,
      updatedAt: new Date(row.updated_at),
      updatedByName: row.updated_by_name,
    };
  }

  async saveStudentNote(
    input: SaveAdminStudentNoteInput,
  ): Promise<AdminStudentNote> {
    const [row] = await this.dataSource.query<
      Array<{
        content: string;
        updated_at: Date;
        updated_by_name: string;
      }>
    >(
      `
      WITH upserted AS (
        INSERT INTO student_admin_notes (
          student_id,
          content,
          updated_at,
          updated_by
        )
        VALUES ($1, $2, NOW(), $3)
        ON CONFLICT (student_id)
        DO UPDATE SET
          content = EXCLUDED.content,
          updated_at = EXCLUDED.updated_at,
          updated_by = EXCLUDED.updated_by
        RETURNING content, updated_at, updated_by
      )
      SELECT
        upserted.content,
        upserted.updated_at,
        updater.full_name AS updated_by_name
      FROM upserted
      INNER JOIN users updater
        ON updater.id = upserted.updated_by
      `,
      [input.studentId, input.content, input.updatedById],
    );

    return {
      content: row.content,
      updatedAt: new Date(row.updated_at),
      updatedByName: row.updated_by_name,
    };
  }

  async listStudentMaterialsProgress(
    studentId: string,
  ): Promise<AdminStudentMaterialProgressItem[]> {
    const rows = await this.dataSource.query<
      Array<{
        material_id: string;
        title: string;
        description: string;
        category_id: string;
        category_key: string;
        category_name: string;
        position: number;
        viewed_at: Date | null;
        links_count: string;
      }>
    >(
      `
      SELECT
        material.id::text AS material_id,
        material.title,
        material.description,
        category.id::text AS category_id,
        category.key AS category_key,
        category.name AS category_name,
        assignment.position,
        access.viewed_at,
        COUNT(link.id)::text AS links_count
      FROM student_material_assignments assignment
      INNER JOIN materials material
        ON material.id = assignment.material_id
      INNER JOIN material_categories category
        ON category.id = material.category_id
      LEFT JOIN student_material_access access
        ON access.student_id = assignment.student_id
        AND access.material_id = assignment.material_id
      LEFT JOIN material_links link
        ON link.material_id = material.id
      WHERE assignment.student_id = $1
      GROUP BY
        material.id,
        material.title,
        material.description,
        category.id,
        category.key,
        category.name,
        assignment.position,
        access.viewed_at
      ORDER BY assignment.position ASC, material.id ASC
      `,
      [studentId],
    );

    return rows.map(
      (row): AdminStudentMaterialProgressItem => ({
        materialId: row.material_id,
        title: row.title,
        description: row.description,
        category: {
          id: row.category_id,
          key: row.category_key,
          name: row.category_name,
        },
        position: row.position,
        viewed: row.viewed_at !== null,
        viewedAt: row.viewed_at ? new Date(row.viewed_at) : null,
        linksCount: Number(row.links_count),
      }),
    );
  }
}
