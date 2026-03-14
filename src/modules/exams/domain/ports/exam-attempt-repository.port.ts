export type CreateExamAttemptInput = {
  examId: string;
  studentId: string;
  score: number;
  passed: boolean;
  answers: Array<{ questionId: string; optionId: string }>;
  review: Array<{
    questionId: string;
    questionText: string;
    position: number;
    options: Array<{ id: string; label: string }>;
    selectedOptionId: string | null;
    correctOptionId: string;
    isCorrect: boolean;
  }>;
};

export const EXAM_ATTEMPT_REPOSITORY = Symbol('EXAM_ATTEMPT_REPOSITORY');

export interface ExamAttemptRepositoryPort {
  createAttemptWithCertificate(
    payload: CreateExamAttemptInput,
  ): Promise<{ attemptId: string; certificateCode: string | null }>;
}
