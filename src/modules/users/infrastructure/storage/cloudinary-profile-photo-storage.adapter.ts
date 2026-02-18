import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { ProfilePhotoStoragePort } from '../../domain/ports/profile-photo-storage.port';

@Injectable()
export class CloudinaryProfilePhotoStorageAdapter implements ProfilePhotoStoragePort {
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
          folder: this.configService.get<string>(
            'CLOUDINARY_PROFILE_PHOTOS_FOLDER',
          ),
          public_id: payload.fileName,
          resource_type: 'image',
          use_filename: true,
          unique_filename: true,
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
}
