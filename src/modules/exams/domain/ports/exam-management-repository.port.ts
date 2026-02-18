import { Exam } from '../exam';

export const EXAM_MANAGEMENT_REPOSITORY = Symbol('EXAM_MANAGEMENT_REPOSITORY');

export type SaveExamPayload = {
  title: string;
  description: string;
  passScore: number;
  isActive: boolean;
  questions: Array<{
    questionText: string;
    options: Array<{ id: string; label: string }>;
    correctOption: string;
    position: number;
  }>;
};

export interface ExamManagementRepositoryPort {
  findAll(): Promise<Exam[]>;
  create(payload: SaveExamPayload): Promise<Exam>;
  update(id: string, payload: Partial<SaveExamPayload>): Promise<Exam | null>;
  delete(id: string): Promise<void>;
}
