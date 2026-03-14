import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  GenerateCertificatePdfUseCase,
} from './generate-certificate-pdf.use-case';
import { CertificatePdfRepositoryPort } from '../../domain/ports/certificate-pdf-repository.port';
import { CertificateDocumentBuilderPort } from '../../domain/ports/certificate-document-builder.port';
import { FileStoragePort } from '../../domain/ports/file-storage.port';
import { ProgressRepositoryPort } from '../../../users/domain/ports/progress-repository.port';

describe('GenerateCertificatePdfUseCase', () => {
  let certificatePdfRepository: jest.Mocked<CertificatePdfRepositoryPort>;
  let certificateDocumentBuilder: jest.Mocked<CertificateDocumentBuilderPort>;
  let fileStorage: jest.Mocked<FileStoragePort>;
  let progressRepository: jest.Mocked<ProgressRepositoryPort>;
  let useCase: GenerateCertificatePdfUseCase;

  beforeEach(() => {
    certificatePdfRepository = {
      findLatestByStudent: jest.fn(),
      updatePdfUrl: jest.fn(),
    };
    certificateDocumentBuilder = {
      buildPdf: jest.fn(),
    };
    fileStorage = {
      uploadBuffer: jest.fn(),
      getDownloadUrl: jest.fn(),
    };
    progressRepository = {
      getStudentProgress: jest.fn(),
    };

    useCase = new GenerateCertificatePdfUseCase(
      certificatePdfRepository,
      certificateDocumentBuilder,
      fileStorage,
      progressRepository,
    );
  });

  it('returns the existing certificate as a signed URL without regenerating it', async () => {
    progressRepository.getStudentProgress.mockResolvedValue({
      materialsTotal: 5,
      materialsViewed: 5,
      examPassed: true,
      certificateIssued: true,
    });
    certificatePdfRepository.findLatestByStudent.mockResolvedValue({
      id: '1',
      studentId: '42',
      studentName: 'Test Student',
      studentEmail: 'student@example.com',
      certificateCode: 'GMC-2026-ABC12345',
      issuedAt: new Date('2026-03-13T12:00:00.000Z'),
      examTitle: 'Final Exam',
      attemptScore: 95,
      pdfUrl:
        'https://res.cloudinary.com/demo/raw/upload/v123/gmc-academy/certificates/test.pdf',
    });
    fileStorage.getDownloadUrl.mockReturnValue(
      'https://api.cloudinary.com/v1_1/demo/raw/download?signature=test',
    );

    const result = await useCase.execute('42');

    expect(result).toEqual({
      certificateId: '1',
      pdfUrl:
        'https://api.cloudinary.com/v1_1/demo/raw/download?signature=test',
    });
    expect(certificateDocumentBuilder.buildPdf).not.toHaveBeenCalled();
    expect(fileStorage.uploadBuffer).not.toHaveBeenCalled();
    expect(certificatePdfRepository.updatePdfUrl).not.toHaveBeenCalled();
  });

  it('uploads the generated PDF and returns a signed URL', async () => {
    const pdfBuffer = Buffer.from('pdf-content');

    progressRepository.getStudentProgress.mockResolvedValue({
      materialsTotal: 5,
      materialsViewed: 5,
      examPassed: true,
      certificateIssued: true,
    });
    certificatePdfRepository.findLatestByStudent.mockResolvedValue({
      id: '1',
      studentId: '42',
      studentName: 'Test Student',
      studentEmail: 'student@example.com',
      certificateCode: 'GMC-2026-ABC12345',
      issuedAt: new Date('2026-03-13T12:00:00.000Z'),
      examTitle: 'Final Exam',
      attemptScore: 95,
      pdfUrl: null,
    });
    certificateDocumentBuilder.buildPdf.mockResolvedValue(pdfBuffer);
    fileStorage.uploadBuffer.mockResolvedValue(
      'https://res.cloudinary.com/demo/raw/upload/v123/gmc-academy/certificates/test.pdf',
    );
    fileStorage.getDownloadUrl.mockReturnValue(
      'https://api.cloudinary.com/v1_1/demo/raw/download?signature=test',
    );

    const result = await useCase.execute('42');

    expect(result).toEqual({
      certificateId: '1',
      pdfUrl:
        'https://api.cloudinary.com/v1_1/demo/raw/download?signature=test',
    });
    expect(certificateDocumentBuilder.buildPdf).toHaveBeenCalledTimes(1);
    expect(fileStorage.uploadBuffer).toHaveBeenCalledWith({
      buffer: pdfBuffer,
      fileName: 'GMC-2026-ABC12345.pdf',
      mimeType: 'application/pdf',
    });
    expect(certificatePdfRepository.updatePdfUrl).toHaveBeenCalledWith(
      '1',
      'https://res.cloudinary.com/demo/raw/upload/v123/gmc-academy/certificates/test.pdf',
    );
  });

  it('throws when the student has not completed the certificate requirements', async () => {
    progressRepository.getStudentProgress.mockResolvedValue({
      materialsTotal: 5,
      materialsViewed: 4,
      examPassed: true,
      certificateIssued: false,
    });

    await expect(useCase.execute('42')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(certificatePdfRepository.findLatestByStudent).not.toHaveBeenCalled();
  });

  it('throws when there is no certificate to generate', async () => {
    progressRepository.getStudentProgress.mockResolvedValue({
      materialsTotal: 5,
      materialsViewed: 5,
      examPassed: true,
      certificateIssued: false,
    });
    certificatePdfRepository.findLatestByStudent.mockResolvedValue(null);

    await expect(useCase.execute('42')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
