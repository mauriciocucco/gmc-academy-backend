import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/ports/user-repository.port';
import { UpdateMyProfileDto } from '../dto/update-my-profile.dto';
import { UserResponseDto } from '../dto/user-response.dto';

@Injectable()
export class UpdateMyProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(
    userId: string,
    dto: UpdateMyProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const fullName = dto.fullName;
    const phone = dto.phone;
    const email = dto.email;

    if (fullName === undefined && phone === undefined && email === undefined) {
      throw new BadRequestException(
        'At least one profile field must be provided',
      );
    }

    if (email && email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email is already in use');
      }
    }

    const updatedUser = await this.userRepository.updateProfile({
      userId,
      fullName,
      phone,
      email,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phone: updatedUser.phone,
      profilePhotoUrl: updatedUser.profilePhotoUrl,
      role: updatedUser.role,
    };
  }
}
