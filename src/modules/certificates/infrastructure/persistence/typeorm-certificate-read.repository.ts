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
      relations: ['examAttempt', 'examAttempt.exam'],
      order: { issuedAt: 'DESC' },
    });

    if (!entity) {
      return null;
    }

    return {
      id: entity.id,
      certificateCode: entity.certificateCode,
      issuedAt: entity.issuedAt,
      pdfPath: entity.pdfPath,
      examTitle: entity.examAttempt.exam.title,
      attemptScore: Number(entity.examAttempt.score),
    };
  }
}
