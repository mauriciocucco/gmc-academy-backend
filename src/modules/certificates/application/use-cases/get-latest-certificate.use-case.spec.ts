import { NotFoundException } from '@nestjs/common';
import { GetLatestCertificateUseCase } from './get-latest-certificate.use-case';
import { CertificateReadRepositoryPort } from '../../domain/ports/certificate-read-repository.port';
import { FileStoragePort } from '../../domain/ports/file-storage.port';

describe('GetLatestCertificateUseCase', () => {
  let certificateReadRepository: jest.Mocked<CertificateReadRepositoryPort>;
  let fileStorage: jest.Mocked<FileStoragePort>;
  let useCase: GetLatestCertificateUseCase;

  beforeEach(() => {
    certificateReadRepository = {
      findLatestForStudent: jest.fn(),
    };
    fileStorage = {
      uploadBuffer: jest.fn(),
      getDownloadUrl: jest.fn(),
    };

    useCase = new GetLatestCertificateUseCase(
      certificateReadRepository,
      fileStorage,
    );
  });

  it('returns a signed PDF URL when the certificate already has a file', async () => {
    const issuedAt = new Date('2026-03-13T12:00:00.000Z');
    certificateReadRepository.findLatestForStudent.mockResolvedValue({
      code: 'GMC-2026-ABC12345',
      studentName: 'Test Student',
      score: 95,
      issuedAt,
      pdfUrl:
        'https://res.cloudinary.com/demo/raw/upload/v123/gmc-academy/certificates/test.pdf',
      examTitle: 'Final Exam',
    });
    fileStorage.getDownloadUrl.mockReturnValue(
      'https://api.cloudinary.com/v1_1/demo/raw/download?signature=test',
    );

    const result = await useCase.execute('42');

    expect(result).toEqual({
      code: 'GMC-2026-ABC12345',
      studentName: 'Test Student',
      score: 95,
      issuedAt: issuedAt.toISOString(),
      pdfUrl:
        'https://api.cloudinary.com/v1_1/demo/raw/download?signature=test',
      examTitle: 'Final Exam',
    });
    expect(fileStorage.getDownloadUrl).toHaveBeenCalledWith(
      'https://res.cloudinary.com/demo/raw/upload/v123/gmc-academy/certificates/test.pdf',
    );
  });

  it('returns null when the certificate does not have a PDF yet', async () => {
    const issuedAt = new Date('2026-03-13T12:00:00.000Z');
    certificateReadRepository.findLatestForStudent.mockResolvedValue({
      code: 'GMC-2026-ABC12345',
      studentName: 'Test Student',
      score: 95,
      issuedAt,
      pdfUrl: null,
      examTitle: 'Final Exam',
    });

    const result = await useCase.execute('42');

    expect(result.pdfUrl).toBeNull();
    expect(fileStorage.getDownloadUrl).not.toHaveBeenCalled();
  });

  it('throws when the student has no certificate', async () => {
    certificateReadRepository.findLatestForStudent.mockResolvedValue(null);

    await expect(useCase.execute('42')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
