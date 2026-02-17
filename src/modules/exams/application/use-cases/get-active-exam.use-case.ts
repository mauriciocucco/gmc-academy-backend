import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  EXAM_READ_REPOSITORY,
  ExamReadRepositoryPort,
} from '../../domain/ports/exam-read-repository.port';
import { ActiveExamResponseDto } from '../dto/active-exam-response.dto';

@Injectable()
export class GetActiveExamUseCase {
  constructor(
    @Inject(EXAM_READ_REPOSITORY)
    private readonly examReadRepository: ExamReadRepositoryPort,
  ) {}

  async execute(): Promise<ActiveExamResponseDto> {
    const exam = await this.examReadRepository.findActive();
    if (!exam) {
      throw new NotFoundException('No active exam found');
    }

    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      passScore: exam.passScore,
      questions: exam.questions
        .sort((a, b) => a.position - b.position)
        .map((question) => ({
          id: question.id,
          text: question.questionText,
          options: question.options,
          position: question.position,
        })),
    };
  }
}
