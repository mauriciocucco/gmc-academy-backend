import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProgressRepositoryPort,
  StudentProgress,
} from '../../domain/ports/progress-repository.port';
import { StudentMaterialAccessTypeOrmEntity } from '../../../../database/typeorm/entities/student-material-access.typeorm-entity';
import { ExamAttemptTypeOrmEntity } from '../../../../database/typeorm/entities/exam-attempt.typeorm-entity';
import { CertificateTypeOrmEntity } from '../../../../database/typeorm/entities/certificate.typeorm-entity';

@Injectable()
export class TypeOrmProgressRepository implements ProgressRepositoryPort {
  constructor(
    @InjectRepository(StudentMaterialAccessTypeOrmEntity)
    private readonly accessRepository: Repository<StudentMaterialAccessTypeOrmEntity>,
    @InjectRepository(ExamAttemptTypeOrmEntity)
    private readonly attemptRepository: Repository<ExamAttemptTypeOrmEntity>,
    @InjectRepository(CertificateTypeOrmEntity)
    private readonly certificateRepository: Repository<CertificateTypeOrmEntity>,
  ) {}

  async getStudentProgress(studentId: string): Promise<StudentProgress> {
    const [materialCounts, examPassed, certificateIssued] = await Promise.all([
      this.accessRepository
        .createQueryBuilder('a')
        .select('COUNT(*)', 'total')
        .addSelect('COUNT(a.viewed_at)', 'viewed')
        .where('a.student_id = :studentId', { studentId })
        .andWhere('a.enabled = true')
        .getRawOne<{ total: string; viewed: string }>(),

      this.attemptRepository.existsBy({ studentId, passed: true }),

      this.certificateRepository.existsBy({ studentId }),
    ]);

    return {
      materialsTotal: Number(materialCounts?.total ?? 0),
      materialsViewed: Number(materialCounts?.viewed ?? 0),
      examPassed,
      certificateIssued,
    };
  }
}
