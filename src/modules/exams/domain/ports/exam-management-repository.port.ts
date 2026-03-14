import { Exam } from '../exam';

export const EXAM_MANAGEMENT_REPOSITORY = Symbol('EXAM_MANAGEMENT_REPOSITORY');

export type SaveExamPayload = {
  title: string;
  description: string;
  passScore: number;
  isActive: boolean;
  updatedById?: string;
  questions: Array<{
    questionText: string;
    options: Array<{ id: string; label: string }>;
    correctOption: string;
    position: number;
  }>;
};

export type SaveActiveExamConfigPayload = {
  title: string;
  description: string;
  passScore: number;
  updatedById: string;
  questions: Array<{
    id?: string;
    questionText: string;
    position: number;
    options: Array<{
      id?: string;
      label: string;
      isCorrect: boolean;
    }>;
  }>;
};

export interface ExamManagementRepositoryPort {
  findAll(): Promise<Exam[]>;
  create(payload: SaveExamPayload): Promise<Exam>;
  update(id: string, payload: Partial<SaveExamPayload>): Promise<Exam | null>;
  saveActiveConfig(payload: SaveActiveExamConfigPayload): Promise<Exam>;
  delete(id: string): Promise<void>;
}
