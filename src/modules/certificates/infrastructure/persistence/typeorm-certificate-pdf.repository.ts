import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CertificatePdfData,
  CertificatePdfRepositoryPort,
} from '../../domain/ports/certificate-pdf-repository.port';
import { CertificateTypeOrmEntity } from '../../../../database/typeorm/entities/certificate.typeorm-entity';

@Injectable()
export class TypeOrmCertificatePdfRepository implements CertificatePdfRepositoryPort {
  constructor(
    @InjectRepository(CertificateTypeOrmEntity)
    private readonly repository: Repository<CertificateTypeOrmEntity>,
  ) {}

  async findLatestByStudent(
    studentId: string,
  ): Promise<CertificatePdfData | null> {
    const entity = await this.repository.findOne({
      where: { studentId },
      relations: ['student', 'examAttempt', 'examAttempt.exam'],
      order: { issuedAt: 'DESC' },
    });

    if (!entity) {
      return null;
    }

    return {
      id: entity.id,
      studentId: entity.studentId,
      studentName: entity.student.fullName,
      studentEmail: entity.student.email,
      certificateCode: entity.certificateCode,
      issuedAt: entity.issuedAt,
      examTitle: entity.examAttempt.exam.title,
      attemptScore: Number(entity.examAttempt.score),
      pdfUrl: entity.pdfUrl,
    };
  }

  async updatePdfUrl(certificateId: string, pdfUrl: string): Promise<void> {
    await this.repository.update({ id: certificateId }, { pdfUrl });
  }
}
