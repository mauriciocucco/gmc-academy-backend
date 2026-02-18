import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PROFILE_PHOTO_STORAGE,
  ProfilePhotoStoragePort,
} from '../../domain/ports/profile-photo-storage.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/ports/user-repository.port';
import { UserResponseDto } from '../dto/user-response.dto';

const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export type ProfilePhotoUploadFile = {
  buffer: Buffer;
  mimetype: string;
};

@Injectable()
export class UploadMyProfilePhotoUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(PROFILE_PHOTO_STORAGE)
    private readonly profilePhotoStorage: ProfilePhotoStoragePort,
  ) {}

  async execute(
    userId: string,
    file: ProfilePhotoUploadFile,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!file?.buffer || !file.mimetype) {
      throw new BadRequestException('Profile photo file is required');
    }

    if (!SUPPORTED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only jpeg, png, and webp are allowed',
      );
    }

    const extension = this.getFileExtension(file.mimetype);
    const profilePhotoUrl = await this.profilePhotoStorage.uploadBuffer({
      buffer: file.buffer,
      fileName: `student-${userId}-${Date.now()}.${extension}`,
      mimeType: file.mimetype,
    });

    const updatedUser = await this.userRepository.updateProfilePhoto(
      userId,
      profilePhotoUrl,
    );

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phone: updatedUser.phone,
      profilePhotoUrl: updatedUser.profilePhotoUrl,
      role: updatedUser.role,
    };
  }

  private getFileExtension(mimeType: string): string {
    if (mimeType === 'image/jpeg') {
      return 'jpg';
    }
    if (mimeType === 'image/png') {
      return 'png';
    }
    return 'webp';
  }
}
