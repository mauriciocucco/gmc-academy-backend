import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  EXAM_MANAGEMENT_REPOSITORY,
  ExamManagementRepositoryPort,
} from '../../domain/ports/exam-management-repository.port';
import { UpdateExamDto } from '../dto/manage-exam.dto';
import { ExamDetailResponseDto } from '../dto/exam-response.dto';
import { validateExamQuestions } from './exam-question.validation';

@Injectable()
export class UpdateExamUseCase {
  constructor(
    @Inject(EXAM_MANAGEMENT_REPOSITORY)
    private readonly examManagementRepository: ExamManagementRepositoryPort,
  ) {}

  async execute(
    examId: string,
    dto: UpdateExamDto,
  ): Promise<ExamDetailResponseDto> {
    if (dto.questions) {
      validateExamQuestions(dto.questions);
    }

    const updated = await this.examManagementRepository.update(examId, {
      title: dto.title?.trim(),
      description: dto.description?.trim(),
      passScore: dto.passScore,
      isActive: dto.isActive,
      questions: dto.questions?.map((question, index) => ({
        questionText: question.questionText.trim(),
        options: question.options.map((option) => ({
          id: option.id.trim(),
          label: option.label.trim(),
        })),
        correctOption: question.correctOption.trim(),
        position: question.position ?? index + 1,
      })),
    });

    if (!updated) {
      throw new NotFoundException('Exam not found');
    }

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      passScore: updated.passScore,
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
      questions: updated.questions
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
