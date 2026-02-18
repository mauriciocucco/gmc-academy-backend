import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateTypeOrmEntity } from '../../database/typeorm/entities/certificate.typeorm-entity';
import { CertificatesController } from './presentation/http/certificates.controller';
import { GetLatestCertificateUseCase } from './application/use-cases/get-latest-certificate.use-case';
import { CERTIFICATE_READ_REPOSITORY } from './domain/ports/certificate-read-repository.port';
import { TypeOrmCertificateReadRepository } from './infrastructure/persistence/typeorm-certificate-read.repository';
import { CERTIFICATE_PDF_REPOSITORY } from './domain/ports/certificate-pdf-repository.port';
import { TypeOrmCertificatePdfRepository } from './infrastructure/persistence/typeorm-certificate-pdf.repository';
import { GenerateCertificatePdfUseCase } from './application/use-cases/generate-certificate-pdf.use-case';
import { CERTIFICATE_DOCUMENT_BUILDER } from './domain/ports/certificate-document-builder.port';
import { PdfkitCertificateDocumentBuilder } from './infrastructure/pdf/pdfkit-certificate-document.builder';
import { FILE_STORAGE } from './domain/ports/file-storage.port';
import { CloudinaryFileStorageAdapter } from './infrastructure/storage/cloudinary-file-storage.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([CertificateTypeOrmEntity])],
  controllers: [CertificatesController],
  providers: [
    GetLatestCertificateUseCase,
    GenerateCertificatePdfUseCase,
    {
      provide: CERTIFICATE_READ_REPOSITORY,
      useClass: TypeOrmCertificateReadRepository,
    },
    {
      provide: CERTIFICATE_PDF_REPOSITORY,
      useClass: TypeOrmCertificatePdfRepository,
    },
    {
      provide: CERTIFICATE_DOCUMENT_BUILDER,
      useClass: PdfkitCertificateDocumentBuilder,
    },
    {
      provide: FILE_STORAGE,
      useClass: CloudinaryFileStorageAdapter,
    },
  ],
})
export class CertificatesModule {}
