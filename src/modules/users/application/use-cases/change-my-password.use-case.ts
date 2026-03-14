import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  PASSWORD_HASHER,
  PasswordHasherPort,
} from '../../../auth/domain/ports/password-hasher.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/ports/user-repository.port';
import { ChangeMyPasswordDto } from '../dto/change-my-password.dto';
import { UserResponseDto } from '../dto/user-response.dto';

@Injectable()
export class ChangeMyPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(
    userId: string,
    dto: ChangeMyPasswordDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    const isValidPassword = await this.passwordHasher.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await this.passwordHasher.hash(dto.newPassword);
    const updatedUser = await this.userRepository.updatePassword({
      userId,
      passwordHash,
      mustChangePassword: false,
      clearRefreshTokenHash: true,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phone: updatedUser.phone,
      profilePhotoUrl: updatedUser.profilePhotoUrl,
      role: updatedUser.role,
      mustChangePassword: updatedUser.mustChangePassword,
    };
  }
}
