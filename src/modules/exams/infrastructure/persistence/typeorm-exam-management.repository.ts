import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DataSource, In, Not } from 'typeorm';
import {
  ExamManagementRepositoryPort,
  SaveActiveExamConfigPayload,
  SaveExamPayload,
} from '../../domain/ports/exam-management-repository.port';
import { Exam } from '../../domain/exam';
import { ExamTypeOrmEntity } from '../../../../database/typeorm/entities/exam.typeorm-entity';
import { ExamQuestionTypeOrmEntity } from '../../../../database/typeorm/entities/exam-question.typeorm-entity';

@Injectable()
export class TypeOrmExamManagementRepository implements ExamManagementRepositoryPort {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(): Promise<Exam[]> {
    const repository = this.dataSource.getRepository(ExamTypeOrmEntity);
    const exams = await repository.find({
      relations: ['questions', 'updatedBy'],
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
        questions: {
          position: 'ASC',
        },
      },
    });

    return exams.map((exam) => this.toDomain(exam));
  }

  async create(payload: SaveExamPayload): Promise<Exam> {
    return this.dataSource.transaction(async (manager) => {
      const examRepository = manager.getRepository(ExamTypeOrmEntity);
      const questionRepository = manager.getRepository(
        ExamQuestionTypeOrmEntity,
      );

      const exam = examRepository.create({
        title: payload.title,
        description: payload.description,
        passScore: payload.passScore.toFixed(2),
        isActive: payload.isActive,
        updatedById: payload.updatedById ?? null,
      });
      const savedExam = await examRepository.save(exam);

      await questionRepository.save(
        payload.questions.map((question) =>
          questionRepository.create({
            examId: savedExam.id,
            questionText: question.questionText,
            optionsJson: question.options,
            correctOption: question.correctOption,
            position: question.position,
          }),
        ),
      );

      const hydrated = await examRepository.findOne({
        where: { id: savedExam.id },
        relations: ['questions', 'updatedBy'],
      });

      return this.toDomain(hydrated as ExamTypeOrmEntity);
    });
  }

  async update(
    id: string,
    payload: Partial<SaveExamPayload>,
  ): Promise<Exam | null> {
    return this.dataSource.transaction(async (manager) => {
      const examRepository = manager.getRepository(ExamTypeOrmEntity);
      const questionRepository = manager.getRepository(
        ExamQuestionTypeOrmEntity,
      );
      const current = await examRepository.findOne({
        where: { id },
        relations: ['questions', 'updatedBy'],
      });
      if (!current) {
        return null;
      }

      await examRepository.update(
        { id },
        {
          title: payload.title ?? current.title,
          description: payload.description ?? current.description,
          passScore: payload.passScore
            ? payload.passScore.toFixed(2)
            : current.passScore,
          isActive: payload.isActive ?? current.isActive,
          updatedById: payload.updatedById ?? current.updatedById,
        },
      );

      if (payload.questions) {
        await questionRepository.delete({ examId: id });
        await questionRepository.save(
          payload.questions.map((question) =>
            questionRepository.create({
              examId: id,
              questionText: question.questionText,
              optionsJson: question.options,
              correctOption: question.correctOption,
              position: question.position,
            }),
          ),
        );
      }

      const hydrated = await examRepository.findOne({
        where: { id },
        relations: ['questions', 'updatedBy'],
      });

      return hydrated ? this.toDomain(hydrated) : null;
    });
  }

  async saveActiveConfig(payload: SaveActiveExamConfigPayload): Promise<Exam> {
    return this.dataSource.transaction(async (manager) => {
      const examRepository = manager.getRepository(ExamTypeOrmEntity);
      const questionRepository = manager.getRepository(
        ExamQuestionTypeOrmEntity,
      );
      const current = await examRepository.findOne({
        where: { isActive: true },
        relations: ['questions', 'updatedBy'],
        order: {
          updatedAt: 'DESC',
          createdAt: 'DESC',
          questions: {
            position: 'ASC',
          },
        },
      });

      const exam = current
        ? await examRepository.save(
            examRepository.create({
              id: current.id,
              title: payload.title,
              description: payload.description,
              passScore: payload.passScore.toFixed(2),
              isActive: current.isActive,
              updatedById: payload.updatedById,
            }),
          )
        : await examRepository.save(
            examRepository.create({
              title: payload.title,
              description: payload.description,
              passScore: payload.passScore.toFixed(2),
              isActive: true,
              updatedById: payload.updatedById,
            }),
          );

      const existingQuestions = current?.questions ?? [];
      const existingQuestionIds = new Set(
        existingQuestions.map((question) => question.id),
      );
      const incomingQuestionIds = new Set<string>();
      const savedQuestions: ExamQuestionTypeOrmEntity[] = [];

      for (const question of payload.questions) {
        const trimmedQuestionId = question.id?.trim();
        if (trimmedQuestionId) {
          if (incomingQuestionIds.has(trimmedQuestionId)) {
            throw new BadRequestException(
              `Question "${trimmedQuestionId}" is duplicated in the payload`,
            );
          }
          incomingQuestionIds.add(trimmedQuestionId);
        }

        if (trimmedQuestionId && !existingQuestionIds.has(trimmedQuestionId)) {
          throw new BadRequestException(
            `Question "${trimmedQuestionId}" does not belong to the active exam`,
          );
        }

        const normalizedOptions = question.options.map((option) => ({
          id: option.id?.trim() || randomUUID(),
          label: option.label,
          isCorrect: option.isCorrect,
        }));
        const correctOption = normalizedOptions.find((option) => option.isCorrect);
        if (!correctOption) {
          throw new BadRequestException(
            `Question "${question.questionText}" must contain exactly 1 correct option`,
          );
        }

        const savedQuestion = await questionRepository.save(
          questionRepository.create({
            id: trimmedQuestionId,
            examId: exam.id,
            questionText: question.questionText,
            optionsJson: normalizedOptions.map((option) => ({
              id: option.id,
              label: option.label,
            })),
            correctOption: correctOption?.id,
            position: question.position,
          }),
        );

        savedQuestions.push(savedQuestion);
      }

      const savedQuestionIds = savedQuestions
        .map((question) => question.id)
        .filter((questionId): questionId is string => Boolean(questionId));

      if (savedQuestionIds.length > 0) {
        await questionRepository.delete({
          examId: exam.id,
          id: Not(In(savedQuestionIds)),
        });
      } else {
        await questionRepository.delete({ examId: exam.id });
      }

      const hydrated = await examRepository.findOne({
        where: { id: exam.id },
        relations: ['questions', 'updatedBy'],
        order: {
          questions: {
            position: 'ASC',
          },
        },
      });

      return this.toDomain(hydrated as ExamTypeOrmEntity);
    });
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.getRepository(ExamTypeOrmEntity).delete({ id });
  }

  private toDomain(entity: ExamTypeOrmEntity): Exam {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      passScore: Number(entity.passScore),
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      updatedByName: entity.updatedBy?.fullName ?? null,
      questions: entity.questions.map((question) => ({
        id: question.id,
        questionText: question.questionText,
        options: question.optionsJson,
        correctOption: question.correctOption,
        position: question.position,
      })),
    };
  }
}
