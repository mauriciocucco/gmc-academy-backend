import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  EXAM_READ_REPOSITORY,
  ExamReadRepositoryPort,
} from '../../domain/ports/exam-read-repository.port';
import {
  EXAM_MANAGEMENT_REPOSITORY,
  ExamManagementRepositoryPort,
} from '../../domain/ports/exam-management-repository.port';

@Injectable()
export class DeleteExamUseCase {
  constructor(
    @Inject(EXAM_READ_REPOSITORY)
    private readonly examReadRepository: ExamReadRepositoryPort,
    @Inject(EXAM_MANAGEMENT_REPOSITORY)
    private readonly examManagementRepository: ExamManagementRepositoryPort,
  ) {}

  async execute(examId: string): Promise<void> {
    const exam = await this.examReadRepository.findById(examId);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    await this.examManagementRepository.delete(examId);
  }
}
