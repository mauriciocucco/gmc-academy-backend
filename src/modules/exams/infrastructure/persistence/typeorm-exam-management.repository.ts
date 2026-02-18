import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  ExamManagementRepositoryPort,
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
      relations: ['questions'],
      order: {
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
        relations: ['questions'],
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
        relations: ['questions'],
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
        relations: ['questions'],
      });

      return hydrated ? this.toDomain(hydrated) : null;
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
