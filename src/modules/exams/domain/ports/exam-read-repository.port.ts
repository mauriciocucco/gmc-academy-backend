import { Exam } from '../exam';

export const EXAM_READ_REPOSITORY = Symbol('EXAM_READ_REPOSITORY');

export interface ExamReadRepositoryPort {
  findActive(): Promise<Exam | null>;
  findActiveMany(): Promise<Exam[]>;
  findById(id: string): Promise<Exam | null>;
}
