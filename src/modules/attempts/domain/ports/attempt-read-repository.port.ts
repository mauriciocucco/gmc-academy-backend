export const ATTEMPT_READ_REPOSITORY = Symbol('ATTEMPT_READ_REPOSITORY');

export type AttemptHistoryItem = {
  id: string;
  examId: string;
  examTitle: string;
  score: number;
  passed: boolean;
  createdAt: Date;
};

export interface AttemptReadRepositoryPort {
  findByStudentId(studentId: string): Promise<AttemptHistoryItem[]>;
}
