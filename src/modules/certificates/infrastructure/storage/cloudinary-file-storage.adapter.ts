import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { FileStoragePort } from '../../domain/ports/file-storage.port';

@Injectable()
export class CloudinaryFileStorageAdapter implements FileStoragePort {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  async uploadBuffer(payload: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
  }): Promise<string> {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException(
        'Cloudinary is not configured: missing CLOUDINARY_* env vars',
      );
    }

    return new Promise<string>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: this.configService.get<string>('CLOUDINARY_FOLDER'),
          public_id: payload.fileName,
          resource_type: 'raw',
          use_filename: false,
          unique_filename: false,
          invalidate: true,
        },
        (error, result) => {
          if (error || !result?.secure_url) {
            reject(
              new InternalServerErrorException(
                `Cloudinary upload failed: ${error?.message ?? 'unknown error'}`,
              ),
            );
            return;
          }

          resolve(result.secure_url);
        },
      );

      Readable.from(payload.buffer).pipe(upload);
    });
  }

  getDownloadUrl(fileUrl: string): string {
    const publicId = this.extractPublicId(fileUrl);
    if (!publicId) {
      return fileUrl;
    }

    const expiresAt =
      Math.floor(Date.now() / 1000) +
      this.getCertificateUrlTtlInSeconds();

    return cloudinary.utils.private_download_url(publicId, 'pdf', {
      resource_type: 'raw',
      type: 'upload',
      expires_at: expiresAt,
    });
  }

  private getCertificateUrlTtlInSeconds(): number {
    const configuredTtl = this.configService.get<string>(
      'CERTIFICATE_PDF_URL_TTL_SECONDS',
    );
    const ttl = Number(configuredTtl);

    if (!Number.isFinite(ttl) || ttl <= 0) {
      return 900;
    }

    return Math.floor(ttl);
  }

  private extractPublicId(fileUrl: string): string | null {
    try {
      const { pathname } = new URL(fileUrl);
      const normalizedPath = decodeURIComponent(pathname);
      const match = normalizedPath.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/i);

      return match?.[1] ?? null;
    } catch {
      return null;
    }
  }
}
