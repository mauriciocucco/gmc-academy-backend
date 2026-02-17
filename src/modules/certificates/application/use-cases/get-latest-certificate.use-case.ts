import { Inject, Injectable } from '@nestjs/common';
import {
  CERTIFICATE_READ_REPOSITORY,
  CertificateReadRepositoryPort,
} from '../../domain/ports/certificate-read-repository.port';

export type LatestCertificateResponseDto = {
  id: string;
  certificateCode: string;
  issuedAt: string;
  pdfPath: string | null;
  examTitle: string;
  attemptScore: number;
} | null;

@Injectable()
export class GetLatestCertificateUseCase {
  constructor(
    @Inject(CERTIFICATE_READ_REPOSITORY)
    private readonly certificateReadRepository: CertificateReadRepositoryPort,
  ) {}

  async execute(studentId: string): Promise<LatestCertificateResponseDto> {
    const certificate =
      await this.certificateReadRepository.findLatestForStudent(studentId);
    if (!certificate) {
      return null;
    }

    return {
      id: certificate.id,
      certificateCode: certificate.certificateCode,
      issuedAt: certificate.issuedAt.toISOString(),
      pdfPath: certificate.pdfPath,
      examTitle: certificate.examTitle,
      attemptScore: certificate.attemptScore,
    };
  }
}
