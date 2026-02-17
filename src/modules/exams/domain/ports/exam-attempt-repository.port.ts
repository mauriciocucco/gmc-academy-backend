export type CreateExamAttemptInput = {
  examId: string;
  studentId: string;
  score: number;
  passed: boolean;
  answers: Array<{ questionId: string; optionId: string }>;
};

export const EXAM_ATTEMPT_REPOSITORY = Symbol('EXAM_ATTEMPT_REPOSITORY');

export interface ExamAttemptRepositoryPort {
  createAttemptWithCertificate(
    payload: CreateExamAttemptInput,
  ): Promise<{ attemptId: string; certificateCode: string | null }>;
}
