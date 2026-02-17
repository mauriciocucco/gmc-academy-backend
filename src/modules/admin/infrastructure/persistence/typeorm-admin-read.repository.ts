import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  AdminReadRepositoryPort,
  AdminStats,
  AdminStudentItem,
} from '../../domain/ports/admin-read-repository.port';

@Injectable()
export class TypeOrmAdminReadRepository implements AdminReadRepositoryPort {
  constructor(private readonly dataSource: DataSource) {}

  async listStudentsWithLatestAttempt(): Promise<AdminStudentItem[]> {
    const rows = await this.dataSource.query<
      Array<{
        id: string;
        full_name: string;
        email: string;
        last_score: string | null;
        approved: boolean | null;
      }>
    >(
      `
      SELECT
        u.id::text AS id,
        u.full_name,
        u.email,
        latest.score::text AS last_score,
        latest.passed AS approved
      FROM users u
      LEFT JOIN LATERAL (
        SELECT ea.score, ea.passed
        FROM exam_attempts ea
        WHERE ea.student_id = u.id
        ORDER BY ea.created_at DESC
        LIMIT 1
      ) latest ON true
      WHERE u.role = 'student'
      ORDER BY u.full_name ASC;
      `,
    );

    return rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      lastAttemptScore: row.last_score ? Number(row.last_score) : null,
      approved: row.approved ?? false,
    }));
  }

  async getStats(): Promise<AdminStats> {
    const [stats] = await this.dataSource.query<
      Array<{
        total_students: string;
        total_attempts: string;
        approved_attempts: string;
        approved_students: string;
      }>
    >(
      `
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'student')::text AS total_students,
        (SELECT COUNT(*) FROM exam_attempts)::text AS total_attempts,
        (SELECT COUNT(*) FROM exam_attempts WHERE passed = true)::text AS approved_attempts,
        (SELECT COUNT(DISTINCT student_id) FROM exam_attempts WHERE passed = true)::text AS approved_students;
      `,
    );

    return {
      totalStudents: Number(stats?.total_students ?? 0),
      totalAttempts: Number(stats?.total_attempts ?? 0),
      approvedAttempts: Number(stats?.approved_attempts ?? 0),
      approvedStudents: Number(stats?.approved_students ?? 0),
    };
  }
}
