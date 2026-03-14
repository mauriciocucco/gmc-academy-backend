import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CERTIFICATE_READ_REPOSITORY,
  CertificateReadRepositoryPort,
} from '../../domain/ports/certificate-read-repository.port';
import {
  FILE_STORAGE,
  FileStoragePort,
} from '../../domain/ports/file-storage.port';
import { LatestCertificateResponseDto } from '../dto/latest-certificate-response.dto';

@Injectable()
export class GetLatestCertificateUseCase {
  constructor(
    @Inject(CERTIFICATE_READ_REPOSITORY)
    private readonly certificateReadRepository: CertificateReadRepositoryPort,
    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStoragePort,
  ) {}

  async execute(studentId: string): Promise<LatestCertificateResponseDto> {
    const certificate =
      await this.certificateReadRepository.findLatestForStudent(studentId);
    if (!certificate) {
      throw new NotFoundException('No certificate found for this student');
    }

    return {
      code: certificate.code,
      studentName: certificate.studentName,
      score: certificate.score,
      issuedAt: certificate.issuedAt.toISOString(),
      pdfUrl: certificate.pdfUrl
        ? this.fileStorage.getDownloadUrl(certificate.pdfUrl)
        : null,
      examTitle: certificate.examTitle,
    };
  }
}
