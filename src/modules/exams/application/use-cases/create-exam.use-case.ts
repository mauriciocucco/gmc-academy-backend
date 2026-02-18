import { Inject, Injectable } from '@nestjs/common';
import {
  EXAM_MANAGEMENT_REPOSITORY,
  ExamManagementRepositoryPort,
} from '../../domain/ports/exam-management-repository.port';
import { CreateExamDto } from '../dto/manage-exam.dto';
import { ExamDetailResponseDto } from '../dto/exam-response.dto';
import { validateExamQuestions } from './exam-question.validation';

@Injectable()
export class CreateExamUseCase {
  constructor(
    @Inject(EXAM_MANAGEMENT_REPOSITORY)
    private readonly examManagementRepository: ExamManagementRepositoryPort,
  ) {}

  async execute(dto: CreateExamDto): Promise<ExamDetailResponseDto> {
    validateExamQuestions(dto.questions);

    const exam = await this.examManagementRepository.create({
      title: dto.title.trim(),
      description: dto.description.trim(),
      passScore: dto.passScore,
      isActive: dto.isActive ?? false,
      questions: dto.questions.map((question, index) => ({
        questionText: question.questionText.trim(),
        options: question.options.map((option) => ({
          id: option.id.trim(),
          label: option.label.trim(),
        })),
        correctOption: question.correctOption.trim(),
        position: question.position ?? index + 1,
      })),
    });

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
