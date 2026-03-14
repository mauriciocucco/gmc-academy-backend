import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/ports/user-repository.port';
import {
  PASSWORD_HASHER,
  PasswordHasherPort,
} from '../../../auth/domain/ports/password-hasher.port';
import {
  CreateAdminStudentDto,
  CreateAdminStudentResponseDto,
} from '../dto/create-admin-student.dto';

const PASSWORD_LENGTH = 10;
const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
const PASSWORD_ALPHABET = `${UPPERCASE}${LOWERCASE}${DIGITS}`;

@Injectable()
export class CreateAdminStudentUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(
    dto: CreateAdminStudentDto,
  ): Promise<CreateAdminStudentResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const temporaryPassword = this.generateTemporaryPassword();
    const passwordHash = await this.passwordHasher.hash(temporaryPassword);
    const student = await this.userRepository.create({
      email: dto.email,
      fullName: dto.fullName,
      phone: dto.phone ?? null,
      passwordHash,
      role: UserRole.STUDENT,
      mustChangePassword: true,
    });

    return {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      temporaryPassword,
      mustChangePassword: student.mustChangePassword,
    };
  }

  private generateTemporaryPassword(): string {
    const chars = [
      this.pickRandomChar(UPPERCASE),
      this.pickRandomChar(LOWERCASE),
      this.pickRandomChar(DIGITS),
    ];

    while (chars.length < PASSWORD_LENGTH) {
      chars.push(this.pickRandomChar(PASSWORD_ALPHABET));
    }

    return this.shuffle(chars).join('');
  }

  private pickRandomChar(source: string): string {
    return source[randomInt(source.length)];
  }

  private shuffle(values: string[]): string[] {
    const result = [...values];

    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = randomInt(index + 1);
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }

    return result;
  }
}
