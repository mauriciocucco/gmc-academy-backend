import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  AdminStudentListResult,
  AdminStudentListItem,
  AdminPerformance,
  AdminPerformanceByExam,
  AdminPerformanceByStudent,
  AdminReadRepositoryPort,
  AdminStats,
  ListAdminStudentsFilters,
} from '../../domain/ports/admin-read-repository.port';

@Injectable()
export class TypeOrmAdminReadRepository implements AdminReadRepositoryPort {
  constructor(private readonly dataSource: DataSource) {}

  async listStudentsWithLatestAttempt(
    filters: ListAdminStudentsFilters,
  ): Promise<AdminStudentListResult> {
    const search =
      filters.search && filters.search.trim().length > 0
        ? `%${filters.search.trim().toLowerCase()}%`
        : null;
    const offset = (filters.page - 1) * filters.pageSize;

    const rows = await this.dataSource.query<
      Array<{
        id: string;
        full_name: string;
        email: string;
        latest_attempt_id: string | null;
        last_score: string | null;
        approved: boolean | null;
        blocked_at: Date | string | null;
        total_count: string;
      }>
    >(
      `
      SELECT
        filtered.id,
        filtered.full_name,
        filtered.email,
        filtered.latest_attempt_id,
        filtered.last_score,
        filtered.approved,
        COUNT(*) OVER()::text AS total_count
      FROM (
        SELECT
          u.id::text AS id,
          u.full_name,
          u.email,
          latest.id::text AS latest_attempt_id,
          latest.score::text AS last_score,
          latest.passed AS approved,
          u.blocked_at
        FROM users u
        LEFT JOIN LATERAL (
          SELECT ea.id, ea.score, ea.passed
          FROM exam_attempts ea
          WHERE ea.student_id = u.id
          ORDER BY ea.created_at DESC
          LIMIT 1
        ) latest ON true
        WHERE u.role = 'student'
          AND ($1::text IS NULL OR LOWER(u.full_name) LIKE $1 OR LOWER(u.email) LIKE $1)
          AND (
            $2::text = 'all'
            OR ($2::text = 'approved' AND latest.passed = true)
            OR ($2::text = 'pending' AND COALESCE(latest.passed, false) = false)
          )
          AND (
            $3::text = 'all'
            OR ($3::text = 'with-attempt' AND latest.id IS NOT NULL)
            OR ($3::text = 'without-attempt' AND latest.id IS NULL)
          )
          AND (
            $4::text = 'all'
            OR ($4::text = 'active' AND u.blocked_at IS NULL)
            OR ($4::text = 'blocked' AND u.blocked_at IS NOT NULL)
          )
      ) filtered
      ORDER BY filtered.full_name ASC, filtered.id ASC
      OFFSET $5
      LIMIT $6;
      `,
      [
        search,
        filters.status,
        filters.attemptState,
        filters.accessStatus,
        offset,
        filters.pageSize,
      ],
    );

    const items = rows.map(
      (row): AdminStudentListItem => ({
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        lastAttemptScore: row.last_score ? Number(row.last_score) : null,
        approved: row.approved ?? false,
        blocked: row.blocked_at != null,
        blockedAt: row.blocked_at ? new Date(row.blocked_at).toISOString() : null,
      }),
    );

    const totalItems = Number(rows[0]?.total_count ?? 0);

    return {
      items,
      meta: {
        page: filters.page,
        pageSize: filters.pageSize,
        totalItems,
        totalPages:
          totalItems === 0 ? 0 : Math.ceil(totalItems / filters.pageSize),
      },
    };
  }

  async getStats(): Promise<AdminStats> {
    const [stats] = await this.dataSource.query<
      Array<{
        total_students: string;
        approved_students: string;
        approval_rate: string;
        average_score: string;
      }>
    >(
      `
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'student')::text AS total_students,
        (SELECT COUNT(DISTINCT student_id) FROM exam_attempts WHERE passed = true)::text AS approved_students,
        COALESCE(
          (
            (SELECT COUNT(DISTINCT student_id) FROM exam_attempts WHERE passed = true)::numeric
            / NULLIF((SELECT COUNT(*) FROM users WHERE role = 'student'), 0)
          ) * 100,
          0
        )::text AS approval_rate,
        (SELECT COALESCE(AVG(score), 0) FROM exam_attempts)::text AS average_score;
      `,
    );

    return {
      totalStudents: Number(stats?.total_students ?? 0),
      approvedStudents: Number(stats?.approved_students ?? 0),
      approvalRate: Number(stats?.approval_rate ?? 0),
      averageScore: Number(stats?.average_score ?? 0),
    };
  }

  async getPerformance(): Promise<AdminPerformance> {
    const [overall] = await this.dataSource.query<
      Array<{
        average_score: string;
        pass_rate: string;
        total_attempts: string;
      }>
    >(
      `
      SELECT
        COALESCE(AVG(ea.score), 0)::text AS average_score,
        COALESCE((SUM(CASE WHEN ea.passed THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0)) * 100, 0)::text AS pass_rate,
        COUNT(*)::text AS total_attempts
      FROM exam_attempts ea;
      `,
    );

    const byExam = await this.dataSource.query<
      Array<{
        exam_id: string;
        exam_title: string;
        attempts: string;
        pass_rate: string;
        average_score: string;
        question_count: string;
      }>
    >(
      `
      SELECT
        e.id::text AS exam_id,
        e.title AS exam_title,
        COUNT(ea.id)::text AS attempts,
        COALESCE((SUM(CASE WHEN ea.passed THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(ea.id), 0)) * 100, 0)::text AS pass_rate,
        COALESCE(AVG(ea.score), 0)::text AS average_score,
        COUNT(DISTINCT eq.id)::text AS question_count
      FROM exams e
      LEFT JOIN exam_attempts ea ON ea.exam_id = e.id
      LEFT JOIN exam_questions eq ON eq.exam_id = e.id
      GROUP BY e.id, e.title
      ORDER BY e.created_at DESC;
      `,
    );

    const byStudent = await this.dataSource.query<
      Array<{
        student_id: string;
        full_name: string;
        email: string;
        attempts: string;
        average_score: string;
        best_score: string | null;
        latest_score: string | null;
        latest_passed: boolean | null;
      }>
    >(
      `
      SELECT
        u.id::text AS student_id,
        u.full_name,
        u.email,
        COUNT(ea.id)::text AS attempts,
        COALESCE(AVG(ea.score), 0)::text AS average_score,
        MAX(ea.score)::text AS best_score,
        latest.score::text AS latest_score,
        latest.passed AS latest_passed
      FROM users u
      LEFT JOIN exam_attempts ea ON ea.student_id = u.id
      LEFT JOIN LATERAL (
        SELECT eal.score, eal.passed
        FROM exam_attempts eal
        WHERE eal.student_id = u.id
        ORDER BY eal.created_at DESC
        LIMIT 1
      ) latest ON true
      WHERE u.role = 'student'
      GROUP BY u.id, u.full_name, u.email, latest.score, latest.passed
      ORDER BY u.full_name ASC;
      `,
    );

    return {
      overall: {
        averageScore: Number(overall?.average_score ?? 0),
        passRate: Number(overall?.pass_rate ?? 0),
        totalAttempts: Number(overall?.total_attempts ?? 0),
      },
      byExam: byExam.map(
        (item): AdminPerformanceByExam => ({
          examId: item.exam_id,
          examTitle: item.exam_title,
          attempts: Number(item.attempts),
          passRate: Number(item.pass_rate),
          averageScore: Number(item.average_score),
          questionCount: Number(item.question_count),
        }),
      ),
      byStudent: byStudent.map(
        (item): AdminPerformanceByStudent => ({
          studentId: item.student_id,
          fullName: item.full_name,
          email: item.email,
          attempts: Number(item.attempts),
          averageScore: Number(item.average_score),
          bestScore: item.best_score ? Number(item.best_score) : null,
          latestScore: item.latest_score ? Number(item.latest_score) : null,
          latestPassed: item.latest_passed,
        }),
      ),
    };
  }
}
