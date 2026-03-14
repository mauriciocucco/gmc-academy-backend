import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AttemptDetail,
  AttemptHistoryItem,
  AttemptReadRepositoryPort,
  AttemptReviewQuestion,
} from '../../domain/ports/attempt-read-repository.port';
import {
  ExamAttemptTypeOrmEntity,
  ExamReviewQuestionPayload,
} from '../../../../database/typeorm/entities/exam-attempt.typeorm-entity';

@Injectable()
export class TypeOrmAttemptReadRepository implements AttemptReadRepositoryPort {
  constructor(
    @InjectRepository(ExamAttemptTypeOrmEntity)
    private readonly repository: Repository<ExamAttemptTypeOrmEntity>,
  ) {}

  async findByStudentId(studentId: string): Promise<AttemptHistoryItem[]> {
    const entities = await this.repository.find({
      where: { studentId },
      relations: ['exam'],
      order: {
        createdAt: 'DESC',
      },
    });

    return entities.map((entity) => ({
      id: entity.id,
      examId: entity.examId,
      examTitle: entity.exam.title,
      score: Number(entity.score),
      passed: entity.passed,
      createdAt: entity.createdAt,
    }));
  }

  async findDetailById(
    studentId: string,
    attemptId: string,
  ): Promise<AttemptDetail | null> {
    const entity = await this.repository.findOne({
      where: { id: attemptId, studentId },
      relations: ['exam', 'exam.questions'],
      order: {
        exam: {
          questions: {
            position: 'ASC',
          },
        },
      },
    });

    if (!entity) {
      return null;
    }

    return {
      id: entity.id,
      examId: entity.examId,
      examTitle: entity.exam.title,
      score: Number(entity.score),
      passed: entity.passed,
      createdAt: entity.createdAt,
      questions: this.toReviewQuestions(entity),
    };
  }

  private toReviewQuestions(
    entity: ExamAttemptTypeOrmEntity,
  ): AttemptReviewQuestion[] {
    if (this.hasSnapshotReview(entity.reviewJson)) {
      return entity.reviewJson.map((question) => ({
        questionId: question.questionId,
        questionText: question.questionText,
        position: question.position,
        options: question.options.map((option) => ({
          id: option.id,
          label: option.label,
        })),
        selectedOptionId: question.selectedOptionId,
        correctOptionId: question.correctOptionId,
        isCorrect: question.isCorrect,
      }));
    }

    const answerByQuestion = new Map(
      entity.answersJson.map((answer) => [answer.questionId, answer.optionId]),
    );

    return entity.exam.questions.map((question) => {
      const selectedOptionId = answerByQuestion.get(question.id) ?? null;
      return {
        questionId: question.id,
        questionText: question.questionText,
        position: question.position,
        options: question.optionsJson.map((option) => ({
          id: option.id,
          label: option.label,
        })),
        selectedOptionId,
        correctOptionId: question.correctOption,
        isCorrect: selectedOptionId === question.correctOption,
      };
    });
  }

  private hasSnapshotReview(
    reviewJson: ExamReviewQuestionPayload[] | null,
  ): reviewJson is ExamReviewQuestionPayload[] {
    return Array.isArray(reviewJson);
  }
}
