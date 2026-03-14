import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  EXAM_READ_REPOSITORY,
  ExamReadRepositoryPort,
} from '../../domain/ports/exam-read-repository.port';
import { AdminExamConfigResponseDto } from '../dto/admin-exam-config.dto';

@Injectable()
export class GetAdminExamConfigUseCase {
  constructor(
    @Inject(EXAM_READ_REPOSITORY)
    private readonly examReadRepository: ExamReadRepositoryPort,
  ) {}

  async execute(): Promise<AdminExamConfigResponseDto> {
    const exam = await this.examReadRepository.findActive();
    if (!exam) {
      throw new NotFoundException('Active exam not found');
    }

    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      passScore: exam.passScore,
      updatedAt: exam.updatedAt.toISOString(),
      updatedByName: exam.updatedByName ?? 'Sistema',
      questions: exam.questions
        .sort((a, b) => a.position - b.position)
        .map((question) => ({
          id: question.id,
          text: question.questionText,
          position: question.position,
          options: question.options.map((option) => ({
            id: option.id,
            label: option.label,
            isCorrect: option.id === question.correctOption,
          })),
        })),
    };
  }
}
