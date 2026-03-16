import { Exam, ExamQuestion } from '../exam';

export const EXAM_READ_REPOSITORY = Symbol('EXAM_READ_REPOSITORY');

export type ListAdminExamQuestionsFilters = {
  page: number;
  pageSize: number;
  search?: string;
};

export type ListAdminExamQuestionsResult = {
  examId: string;
  title: string;
  description: string;
  passScore: number;
  updatedAt: Date;
  updatedByName: string | null;
  items: ExamQuestion[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

export interface ExamReadRepositoryPort {
  findActive(): Promise<Exam | null>;
  findActiveMany(): Promise<Exam[]>;
  listActiveQuestions(
    filters: ListAdminExamQuestionsFilters,
  ): Promise<ListAdminExamQuestionsResult | null>;
  findById(id: string): Promise<Exam | null>;
}
