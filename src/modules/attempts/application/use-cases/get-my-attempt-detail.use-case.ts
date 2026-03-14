import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ATTEMPT_READ_REPOSITORY,
  AttemptReadRepositoryPort,
} from '../../domain/ports/attempt-read-repository.port';
import { AttemptDetailResponseDto } from '../dto/attempt-response.dto';

@Injectable()
export class GetMyAttemptDetailUseCase {
  constructor(
    @Inject(ATTEMPT_READ_REPOSITORY)
    private readonly attemptReadRepository: AttemptReadRepositoryPort,
  ) {}

  async execute(
    studentId: string,
    attemptId: string,
  ): Promise<AttemptDetailResponseDto> {
    const attempt = await this.attemptReadRepository.findDetailById(
      studentId,
      attemptId,
    );

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    return {
      id: attempt.id,
      examId: attempt.examId,
      examTitle: attempt.examTitle,
      score: attempt.score,
      passed: attempt.passed,
      createdAt: attempt.createdAt.toISOString(),
      correctAnswers: attempt.questions.filter((question) => question.isCorrect)
        .length,
      totalQuestions: attempt.questions.length,
      questions: attempt.questions
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((question) => {
          const selectedOption =
            question.options.find(
              (option) => option.id === question.selectedOptionId,
            ) ?? null;
          const correctOption =
            question.options.find(
              (option) => option.id === question.correctOptionId,
            ) ?? null;

          return {
            questionId: question.questionId,
            questionText: question.questionText,
            position: question.position,
            options: question.options,
            selectedOptionId: question.selectedOptionId,
            selectedOptionLabel: selectedOption?.label ?? null,
            correctOptionId: question.correctOptionId,
            correctOptionLabel: correctOption?.label ?? null,
            isCorrect: question.isCorrect,
          };
        }),
    };
  }
}
