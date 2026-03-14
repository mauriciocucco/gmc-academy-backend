import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/ports/user-repository.port';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import {
  ATTEMPT_READ_REPOSITORY,
  AttemptReadRepositoryPort,
} from '../../../attempts/domain/ports/attempt-read-repository.port';
import { AttemptDetailResponseDto } from '../../../attempts/application/dto/attempt-response.dto';

@Injectable()
export class GetAdminStudentAttemptDetailUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(ATTEMPT_READ_REPOSITORY)
    private readonly attemptReadRepository: AttemptReadRepositoryPort,
  ) {}

  async execute(
    studentId: string,
    attemptId: string,
  ): Promise<AttemptDetailResponseDto> {
    const student = await this.userRepository.findById(studentId);
    if (!student || student.role !== UserRole.STUDENT) {
      throw new NotFoundException('Student not found');
    }

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
