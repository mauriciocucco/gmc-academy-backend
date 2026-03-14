export const ATTEMPT_READ_REPOSITORY = Symbol('ATTEMPT_READ_REPOSITORY');

export type AttemptHistoryItem = {
  id: string;
  examId: string;
  examTitle: string;
  score: number;
  passed: boolean;
  createdAt: Date;
};

export type AttemptReviewQuestion = {
  questionId: string;
  questionText: string;
  position: number;
  options: Array<{ id: string; label: string }>;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
};

export type AttemptDetail = AttemptHistoryItem & {
  questions: AttemptReviewQuestion[];
};

export interface AttemptReadRepositoryPort {
  findByStudentId(studentId: string): Promise<AttemptHistoryItem[]>;
  findDetailById(
    studentId: string,
    attemptId: string,
  ): Promise<AttemptDetail | null>;
}
