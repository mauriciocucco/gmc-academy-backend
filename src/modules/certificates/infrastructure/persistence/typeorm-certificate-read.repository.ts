import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CertificateReadRepositoryPort,
  LatestCertificate,
} from '../../domain/ports/certificate-read-repository.port';
import { CertificateTypeOrmEntity } from '../../../../database/typeorm/entities/certificate.typeorm-entity';

@Injectable()
export class TypeOrmCertificateReadRepository implements CertificateReadRepositoryPort {
  constructor(
    @InjectRepository(CertificateTypeOrmEntity)
    private readonly repository: Repository<CertificateTypeOrmEntity>,
  ) {}

  async findLatestForStudent(
    studentId: string,
  ): Promise<LatestCertificate | null> {
    const entity = await this.repository.findOne({
      where: { studentId },
      relations: ['student', 'examAttempt', 'examAttempt.exam'],
      order: { issuedAt: 'DESC' },
    });

    if (!entity) {
      return null;
    }

    return {
      code: entity.certificateCode,
      studentName: entity.student.fullName,
      score: Number(entity.examAttempt.score),
      issuedAt: entity.issuedAt,
      pdfUrl: entity.pdfUrl,
      examTitle: entity.examAttempt.exam.title,
    };
  }
}
