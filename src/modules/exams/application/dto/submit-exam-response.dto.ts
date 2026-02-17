export class SubmitExamResponseDto {
  attemptId!: string;
  score!: number;
  passed!: boolean;
  correctAnswers!: number;
  totalQuestions!: number;
  certificateCode!: string | null;
}
