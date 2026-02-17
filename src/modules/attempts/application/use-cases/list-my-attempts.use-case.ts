import { Inject, Injectable } from '@nestjs/common';
import {
  ATTEMPT_READ_REPOSITORY,
  AttemptReadRepositoryPort,
} from '../../domain/ports/attempt-read-repository.port';

export type AttemptResponseDto = {
  id: string;
  examId: string;
  examTitle: string;
  score: number;
  passed: boolean;
  createdAt: string;
};

@Injectable()
export class ListMyAttemptsUseCase {
  constructor(
    @Inject(ATTEMPT_READ_REPOSITORY)
    private readonly attemptReadRepository: AttemptReadRepositoryPort,
  ) {}

  async execute(studentId: string): Promise<AttemptResponseDto[]> {
    const attempts =
      await this.attemptReadRepository.findByStudentId(studentId);
    return attempts.map((attempt) => ({
      id: attempt.id,
      examId: attempt.examId,
      examTitle: attempt.examTitle,
      score: attempt.score,
      passed: attempt.passed,
      createdAt: attempt.createdAt.toISOString(),
    }));
  }
}
