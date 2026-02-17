import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AttemptHistoryItem,
  AttemptReadRepositoryPort,
} from '../../domain/ports/attempt-read-repository.port';
import { ExamAttemptTypeOrmEntity } from '../../../../database/typeorm/entities/exam-attempt.typeorm-entity';

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
}
