import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  EXAM_READ_REPOSITORY,
  ExamReadRepositoryPort,
} from '../../domain/ports/exam-read-repository.port';
import { ExamDetailResponseDto } from '../dto/exam-response.dto';

@Injectable()
export class GetExamDetailUseCase {
  constructor(
    @Inject(EXAM_READ_REPOSITORY)
    private readonly examReadRepository: ExamReadRepositoryPort,
  ) {}

  async execute(examId: string): Promise<ExamDetailResponseDto> {
    const exam = await this.examReadRepository.findById(examId);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      passScore: exam.passScore,
      isActive: exam.isActive,
      createdAt: exam.createdAt.toISOString(),
      questions: exam.questions
        .sort((a, b) => a.position - b.position)
        .map((question) => ({
          id: question.id,
          questionText: question.questionText,
          options: question.options,
          correctOption: question.correctOption,
          position: question.position,
        })),
    };
  }
}
