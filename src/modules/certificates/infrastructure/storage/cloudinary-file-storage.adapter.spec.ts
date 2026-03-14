import { ConfigService } from '@nestjs/config';
import { CloudinaryFileStorageAdapter } from './cloudinary-file-storage.adapter';

describe('CloudinaryFileStorageAdapter', () => {
  const env: Record<string, string> = {
    CLOUDINARY_CLOUD_NAME: 'demo',
    CLOUDINARY_API_KEY: '1234567890',
    CLOUDINARY_API_SECRET: 'test-secret',
    CERTIFICATE_PDF_URL_TTL_SECONDS: '600',
  };

  const configService = {
    get: jest.fn((key: string) => env[key]),
  } as unknown as ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates a signed download URL for stored certificate PDFs', () => {
    jest.spyOn(Date, 'now').mockReturnValue(
      new Date('2026-03-13T12:00:00.000Z').getTime(),
    );

    const adapter = new CloudinaryFileStorageAdapter(configService);
    const result = adapter.getDownloadUrl(
      'https://res.cloudinary.com/demo/raw/upload/v123/gmc-academy/certificates/test.pdf',
    );
    const parsed = new URL(result);

    expect(parsed.pathname).toBe('/v1_1/demo/raw/download');
    expect(parsed.searchParams.get('public_id')).toBe(
      'gmc-academy/certificates/test.pdf',
    );
    expect(parsed.searchParams.get('format')).toBe('pdf');
    expect(parsed.searchParams.get('type')).toBe('upload');
    expect(parsed.searchParams.get('expires_at')).toBe('1773403800');
  });

  it('falls back to the original URL when the stored URL cannot be parsed', () => {
    const adapter = new CloudinaryFileStorageAdapter(configService);
    const result = adapter.getDownloadUrl('not-a-valid-url');

    expect(result).toBe('not-a-valid-url');
  });
});
