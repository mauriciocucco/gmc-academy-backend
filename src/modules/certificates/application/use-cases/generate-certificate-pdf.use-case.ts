import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
  ) {}

  async execute(
    studentId: string,
  ): Promise<GeneratedCertificatePdfResponseDto> {
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
