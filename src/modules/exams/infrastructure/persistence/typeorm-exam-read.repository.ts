import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ExamReadRepositoryPort,
  ListAdminExamQuestionsFilters,
  ListAdminExamQuestionsResult,
} from '../../domain/ports/exam-read-repository.port';
import { Exam } from '../../domain/exam';
import { ExamTypeOrmEntity } from '../../../../database/typeorm/entities/exam.typeorm-entity';

@Injectable()
export class TypeOrmExamReadRepository implements ExamReadRepositoryPort {
  constructor(
    @InjectRepository(ExamTypeOrmEntity)
    private readonly repository: Repository<ExamTypeOrmEntity>,
  ) {}

  async findActive(): Promise<Exam | null> {
    const entity = await this.repository.findOne({
      where: { isActive: true },
      relations: ['questions', 'updatedBy'],
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
        questions: {
          position: 'ASC',
        },
      },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findActiveMany(): Promise<Exam[]> {
    const entities = await this.repository.find({
      where: { isActive: true },
      relations: ['questions', 'updatedBy'],
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
        questions: {
          position: 'ASC',
        },
      },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async listActiveQuestions(
    filters: ListAdminExamQuestionsFilters,
  ): Promise<ListAdminExamQuestionsResult | null> {
    const [activeExam] = await this.repository.query<
      Array<{
        id: string;
        title: string;
        description: string;
        pass_score: string;
        updated_at: Date | string;
        updated_by_name: string | null;
      }>
    >(
      `
      SELECT
        e.id::text AS id,
        e.title,
        e.description,
        e.pass_score::text AS pass_score,
        e.updated_at,
        u.full_name AS updated_by_name
      FROM exams e
      LEFT JOIN users u ON u.id = e.updated_by
      WHERE e.is_active = true
      ORDER BY e.updated_at DESC, e.created_at DESC
      LIMIT 1;
      `,
    );

    if (!activeExam) {
      return null;
    }

    const search =
      filters.search && filters.search.trim().length > 0
        ? `%${filters.search.trim().toLowerCase()}%`
        : null;
    const offset = (filters.page - 1) * filters.pageSize;

    const [countRow] = await this.repository.query<Array<{ total: string }>>(
      `
      SELECT COUNT(*)::text AS total
      FROM exam_questions q
      WHERE q.exam_id = $1
        AND (
          $2::text IS NULL
          OR LOWER(q.question_text) LIKE $2
          OR EXISTS (
            SELECT 1
            FROM jsonb_array_elements(q.options_json) AS option
            WHERE LOWER(option ->> 'label') LIKE $2
          )
        );
      `,
      [activeExam.id, search],
    );

    const rows = await this.repository.query<
      Array<{
        id: string;
        question_text: string;
        position: number | string;
        options_json: Array<{ id: string; label: string }>;
        correct_option: string;
      }>
    >(
      `
      SELECT
        q.id::text AS id,
        q.question_text,
        q.position,
        q.options_json,
        q.correct_option
      FROM exam_questions q
      WHERE q.exam_id = $1
        AND (
          $2::text IS NULL
          OR LOWER(q.question_text) LIKE $2
          OR EXISTS (
            SELECT 1
            FROM jsonb_array_elements(q.options_json) AS option
            WHERE LOWER(option ->> 'label') LIKE $2
          )
        )
      ORDER BY q.position ASC, q.id ASC
      OFFSET $3
      LIMIT $4;
      `,
      [activeExam.id, search, offset, filters.pageSize],
    );

    const totalItems = Number(countRow?.total ?? 0);

    return {
      examId: activeExam.id,
      title: activeExam.title,
      description: activeExam.description,
      passScore: Number(activeExam.pass_score),
      updatedAt: new Date(activeExam.updated_at),
      updatedByName: activeExam.updated_by_name,
      items: rows.map((row) => ({
        id: row.id,
        questionText: row.question_text,
        position: Number(row.position),
        options: row.options_json,
        correctOption: row.correct_option,
      })),
      meta: {
        page: filters.page,
        pageSize: filters.pageSize,
        totalItems,
        totalPages:
          totalItems === 0 ? 0 : Math.ceil(totalItems / filters.pageSize),
      },
    };
  }

  async findById(id: string): Promise<Exam | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['questions', 'updatedBy'],
      order: {
        questions: {
          position: 'ASC',
        },
      },
    });
    return entity ? this.toDomain(entity) : null;
  }

  private toDomain(entity: ExamTypeOrmEntity): Exam {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      passScore: Number(entity.passScore),
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      updatedByName: entity.updatedBy?.fullName ?? null,
      questions: entity.questions.map((question) => ({
        id: question.id,
        questionText: question.questionText,
        options: question.optionsJson,
        correctOption: question.correctOption,
        position: question.position,
      })),
    };
  }
}
