import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamReadRepositoryPort } from '../../domain/ports/exam-read-repository.port';
import { Exam } from '../../domain/exam';
import { ExamTypeOrmEntity } from '../../../../database/typeorm/entities/exam.typeorm-entity';

@Injectable()
export class TypeOrmExamReadRepository implements ExamReadRepositoryPort {
  constructor(
    @InjectRepository(ExamTypeOrmEntity)
    private readonly repository: Repository<ExamTypeOrmEntity>,
  ) {}

  async findActive(): Promise<Exam | null> {
    const entity = await this.repository.findOne({
      where: { isActive: true },
      relations: ['questions'],
      order: {
        createdAt: 'DESC',
        questions: {
          position: 'ASC',
        },
      },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findActiveMany(): Promise<Exam[]> {
    const entities = await this.repository.find({
      where: { isActive: true },
      relations: ['questions'],
      order: {
        createdAt: 'DESC',
        questions: {
          position: 'ASC',
        },
      },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findById(id: string): Promise<Exam | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['questions'],
      order: {
        questions: {
          position: 'ASC',
        },
      },
    });
    return entity ? this.toDomain(entity) : null;
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
