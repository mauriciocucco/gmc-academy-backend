import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CERTIFICATE_PDF_REPOSITORY,
  CertificatePdfRepositoryPort,
} from '../../domain/ports/certificate-pdf-repository.port';
import {
  CERTIFICATE_DOCUMENT_BUILDER,
  CertificateDocumentBuilderPort,
} from '../../domain/ports/certificate-document-builder.port';
import {
  FILE_STORAGE,
  FileStoragePort,
} from '../../domain/ports/file-storage.port';
import {
  PROGRESS_REPOSITORY,
  ProgressRepositoryPort,
} from '../../../users/domain/ports/progress-repository.port';

export type GeneratedCertificatePdfResponseDto = {
  certificateId: string;
  pdfUrl: string;
};

@Injectable()
export class GenerateCertificatePdfUseCase {
  constructor(
    @Inject(CERTIFICATE_PDF_REPOSITORY)
    private readonly certificatePdfRepository: CertificatePdfRepositoryPort,
    @Inject(CERTIFICATE_DOCUMENT_BUILDER)
    private readonly certificateDocumentBuilder: CertificateDocumentBuilderPort,
    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStoragePort,
    @Inject(PROGRESS_REPOSITORY)
    private readonly progressRepository: ProgressRepositoryPort,
  ) {}

  async execute(
    studentId: string,
  ): Promise<GeneratedCertificatePdfResponseDto> {
    const progress =
      await this.progressRepository.getStudentProgress(studentId);
    if (
      progress.materialsViewed < progress.materialsTotal ||
      !progress.examPassed
    ) {
      throw new ForbiddenException(
        'You must view all materials and pass the exam before downloading your certificate',
      );
    }

    const certificate =
      await this.certificatePdfRepository.findLatestByStudent(studentId);
    if (!certificate) {
      throw new NotFoundException('No certificate found for student');
    }

    if (certificate.pdfUrl) {
      return {
        certificateId: certificate.id,
        pdfUrl: certificate.pdfUrl,
      };
    }

    const pdfBuffer =
      await this.certificateDocumentBuilder.buildPdf(certificate);
    const pdfUrl = await this.fileStorage.uploadBuffer({
      buffer: pdfBuffer,
      fileName: `${certificate.certificateCode}.pdf`,
      mimeType: 'application/pdf',
    });

    await this.certificatePdfRepository.updatePdfUrl(certificate.id, pdfUrl);

    return {
      certificateId: certificate.id,
      pdfUrl,
    };
  }
}
