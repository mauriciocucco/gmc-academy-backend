import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  CreateExamAttemptInput,
  ExamAttemptRepositoryPort,
} from '../../domain/ports/exam-attempt-repository.port';
import { ExamAttemptTypeOrmEntity } from '../../../../database/typeorm/entities/exam-attempt.typeorm-entity';
import { CertificateTypeOrmEntity } from '../../../../database/typeorm/entities/certificate.typeorm-entity';
import { randomUUID } from 'crypto';

@Injectable()
export class TypeOrmExamAttemptRepository implements ExamAttemptRepositoryPort {
  constructor(private readonly dataSource: DataSource) {}

  async createAttemptWithCertificate(
    payload: CreateExamAttemptInput,
  ): Promise<{ attemptId: string; certificateCode: string | null }> {
    return this.dataSource.transaction(async (manager) => {
      const attemptRepository = manager.getRepository(ExamAttemptTypeOrmEntity);
      const certificateRepository = manager.getRepository(
        CertificateTypeOrmEntity,
      );

      const attempt = attemptRepository.create({
        examId: payload.examId,
        studentId: payload.studentId,
        score: payload.score.toFixed(2),
        passed: payload.passed,
        answersJson: payload.answers.map((answer) => ({
          questionId: answer.questionId,
          optionId: answer.optionId,
        })),
      });
      const savedAttempt = await attemptRepository.save(attempt);

      if (!payload.passed) {
        return {
          attemptId: savedAttempt.id,
          certificateCode: null,
        };
      }

      const certificateCode = this.generateCertificateCode();
      const certificate = certificateRepository.create({
        studentId: payload.studentId,
        examAttemptId: savedAttempt.id,
        certificateCode,
        pdfUrl: null,
      });
      await certificateRepository.save(certificate);

      return {
        attemptId: savedAttempt.id,
        certificateCode,
      };
    });
  }

  private generateCertificateCode(): string {
    const year = new Date().getUTCFullYear();
    const token = randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
    return `GMC-${year}-${token}`;
  }
}
