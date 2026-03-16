import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  EXAM_READ_REPOSITORY,
  ExamReadRepositoryPort,
  ListAdminExamQuestionsFilters,
} from '../../domain/ports/exam-read-repository.port';
import { ListAdminExamQuestionsResponseDto } from '../dto/list-admin-exam-questions.dto';
import { toAdminExamQuestionResponseDto } from './admin-exam-question.mapper';

@Injectable()
export class ListAdminExamQuestionsUseCase {
  constructor(
    @Inject(EXAM_READ_REPOSITORY)
    private readonly examReadRepository: ExamReadRepositoryPort,
  ) {}

  async execute(
    filters: ListAdminExamQuestionsFilters,
  ): Promise<ListAdminExamQuestionsResponseDto> {
    const result = await this.examReadRepository.listActiveQuestions(filters);
    if (!result) {
      throw new NotFoundException('Active exam not found');
    }

    return {
      examId: result.examId,
      title: result.title,
      description: result.description,
      passScore: result.passScore,
      updatedAt: result.updatedAt.toISOString(),
      updatedByName: result.updatedByName ?? 'Sistema',
      items: result.items
        .sort((a, b) => a.position - b.position)
        .map(toAdminExamQuestionResponseDto),
      meta: result.meta,
    };
  }
}
