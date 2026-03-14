import { Inject, Injectable } from '@nestjs/common';
import {
  EXAM_MANAGEMENT_REPOSITORY,
  ExamManagementRepositoryPort,
} from '../../domain/ports/exam-management-repository.port';
import {
  AdminExamConfigResponseDto,
  UpdateAdminExamConfigDto,
} from '../dto/admin-exam-config.dto';
import { validateAdminExamConfigQuestions } from './admin-exam-config.validation';

@Injectable()
export class UpdateAdminExamConfigUseCase {
  constructor(
    @Inject(EXAM_MANAGEMENT_REPOSITORY)
    private readonly examManagementRepository: ExamManagementRepositoryPort,
  ) {}

  async execute(
    adminId: string,
    dto: UpdateAdminExamConfigDto,
  ): Promise<AdminExamConfigResponseDto> {
    validateAdminExamConfigQuestions(dto.questions);

    const exam = await this.examManagementRepository.saveActiveConfig({
      title: dto.title.trim(),
      description: dto.description.trim(),
      passScore: dto.passScore,
      updatedById: adminId,
      questions: dto.questions.map((question) => ({
        id: question.id?.trim(),
        questionText: question.text.trim(),
        position: question.position,
        options: question.options.map((option) => ({
          id: option.id?.trim(),
          label: option.label.trim(),
          isCorrect: option.isCorrect,
        })),
      })),
    });

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
