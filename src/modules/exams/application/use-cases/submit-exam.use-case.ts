import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EXAM_READ_REPOSITORY,
  ExamReadRepositoryPort,
} from '../../domain/ports/exam-read-repository.port';
import {
  EXAM_ATTEMPT_REPOSITORY,
  ExamAttemptRepositoryPort,
} from '../../domain/ports/exam-attempt-repository.port';
import { SubmitExamDto } from '../dto/submit-exam.dto';
import { SubmitExamResponseDto } from '../dto/submit-exam-response.dto';

@Injectable()
export class SubmitExamUseCase {
  constructor(
    @Inject(EXAM_READ_REPOSITORY)
    private readonly examReadRepository: ExamReadRepositoryPort,
    @Inject(EXAM_ATTEMPT_REPOSITORY)
    private readonly examAttemptRepository: ExamAttemptRepositoryPort,
  ) {}

  async execute(
    examId: string,
    studentId: string,
    dto: SubmitExamDto,
  ): Promise<SubmitExamResponseDto> {
    const exam = await this.examReadRepository.findById(examId);
    if (!exam || !exam.isActive) {
      throw new NotFoundException('Active exam not found');
    }

    if (exam.questions.length === 0) {
      throw new BadRequestException('Exam has no questions');
    }

    const answerByQuestion = new Map<string, string>();
    for (const answer of dto.answers) {
      answerByQuestion.set(answer.questionId, answer.optionId);
    }

    const allQuestionIds = new Set(
      exam.questions.map((question) => question.id),
    );
    const invalidAnswers = dto.answers.some(
      (answer) => !allQuestionIds.has(answer.questionId),
    );
    if (invalidAnswers) {
      throw new BadRequestException(
        'Answers contain invalid question identifiers',
      );
    }

    let correctAnswers = 0;
    for (const question of exam.questions) {
      if (answerByQuestion.get(question.id) === question.correctOption) {
        correctAnswers += 1;
      }
    }

    const rawScore = (correctAnswers / exam.questions.length) * 100;
    const score = Math.round(rawScore * 100) / 100;
    const passed = score >= exam.passScore;

    const persisted =
      await this.examAttemptRepository.createAttemptWithCertificate({
        examId,
        studentId,
        score,
        passed,
        answers: dto.answers,
      });

    return {
      attemptId: persisted.attemptId,
      score,
      passed,
      correctAnswers,
      totalQuestions: exam.questions.length,
      certificateCode: persisted.certificateCode,
    };
  }
}
