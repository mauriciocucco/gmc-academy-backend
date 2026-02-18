import { Inject, Injectable } from '@nestjs/common';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import {
  EXAM_READ_REPOSITORY,
  ExamReadRepositoryPort,
} from '../../domain/ports/exam-read-repository.port';
import {
  EXAM_MANAGEMENT_REPOSITORY,
  ExamManagementRepositoryPort,
} from '../../domain/ports/exam-management-repository.port';
import { ExamSummaryResponseDto } from '../dto/exam-response.dto';

@Injectable()
export class ListExamsUseCase {
  constructor(
    @Inject(EXAM_READ_REPOSITORY)
    private readonly examReadRepository: ExamReadRepositoryPort,
    @Inject(EXAM_MANAGEMENT_REPOSITORY)
    private readonly examManagementRepository: ExamManagementRepositoryPort,
  ) {}

  async execute(role: UserRole): Promise<ExamSummaryResponseDto[]> {
    const exams =
      role === UserRole.ADMIN
        ? await this.examManagementRepository.findAll()
        : await this.examReadRepository.findActiveMany();

    return exams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      passScore: exam.passScore,
      isActive: exam.isActive,
      questionCount: exam.questions.length,
      createdAt: exam.createdAt.toISOString(),
    }));
  }
}
