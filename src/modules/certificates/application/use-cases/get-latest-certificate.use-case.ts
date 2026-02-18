import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CERTIFICATE_READ_REPOSITORY,
  CertificateReadRepositoryPort,
} from '../../domain/ports/certificate-read-repository.port';

export type LatestCertificateResponseDto = {
  id: string;
  certificateCode: string;
  issuedAt: string;
  pdfUrl: string | null;
  examTitle: string;
  attemptScore: number;
};

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
      throw new NotFoundException('No certificate found for this student');
    }

    return {
      id: certificate.id,
      certificateCode: certificate.certificateCode,
      issuedAt: certificate.issuedAt.toISOString(),
      pdfUrl: certificate.pdfUrl,
      examTitle: certificate.examTitle,
      attemptScore: certificate.attemptScore,
    };
  }
}
