import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { PasswordHasherPort } from '../../../auth/domain/ports/password-hasher.port';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { ChangeMyPasswordUseCase } from './change-my-password.use-case';

describe('ChangeMyPasswordUseCase', () => {
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;
  let useCase: ChangeMyPasswordUseCase;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      saveRefreshTokenHash: jest.fn(),
      clearRefreshTokenHash: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
      updateProfilePhoto: jest.fn(),
      updateAccessStatus: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    useCase = new ChangeMyPasswordUseCase(userRepository, passwordHasher);
  });

  it('updates the password and clears the must-change flag', async () => {
    userRepository.findById.mockResolvedValue({
      id: '42',
      email: 'student@example.com',
      fullName: 'Alumno Demo',
      phone: '+5491122334455',
      profilePhotoUrl: null,
      role: UserRole.STUDENT,
      passwordHash: 'old-hash',
      refreshTokenHash: 'refresh-hash',
      mustChangePassword: true,
      createdAt: new Date('2026-03-14T18:40:00.000Z'),
    });
    passwordHasher.compare.mockResolvedValue(true);
    passwordHasher.hash.mockResolvedValue('new-hash');
    userRepository.updatePassword.mockResolvedValue({
      id: '42',
      email: 'student@example.com',
      fullName: 'Alumno Demo',
      phone: '+5491122334455',
      profilePhotoUrl: null,
      role: UserRole.STUDENT,
      passwordHash: 'new-hash',
      refreshTokenHash: null,
      mustChangePassword: false,
      createdAt: new Date('2026-03-14T18:40:00.000Z'),
    });

    const result = await useCase.execute('42', {
      currentPassword: 'Temp1234',
      newPassword: 'NuevaClave123',
    });

    expect(passwordHasher.compare).toHaveBeenCalledWith('Temp1234', 'old-hash');
    expect(passwordHasher.hash).toHaveBeenCalledWith('NuevaClave123');
    expect(userRepository.updatePassword).toHaveBeenCalledWith({
      userId: '42',
      passwordHash: 'new-hash',
      mustChangePassword: false,
      clearRefreshTokenHash: true,
    });
    expect(result.mustChangePassword).toBe(false);
  });

  it('throws when the user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('42', {
        currentPassword: 'Temp1234',
        newPassword: 'NuevaClave123',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when the new password matches the current one', async () => {
    userRepository.findById.mockResolvedValue({
      id: '42',
      email: 'student@example.com',
      fullName: 'Alumno Demo',
      phone: null,
      profilePhotoUrl: null,
      role: UserRole.STUDENT,
      passwordHash: 'old-hash',
      refreshTokenHash: null,
      mustChangePassword: true,
      createdAt: new Date(),
    });

    await expect(
      useCase.execute('42', {
        currentPassword: 'Temp1234',
        newPassword: 'Temp1234',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when the current password is invalid', async () => {
    userRepository.findById.mockResolvedValue({
      id: '42',
      email: 'student@example.com',
      fullName: 'Alumno Demo',
      phone: null,
      profilePhotoUrl: null,
      role: UserRole.STUDENT,
      passwordHash: 'old-hash',
      refreshTokenHash: null,
      mustChangePassword: true,
      createdAt: new Date(),
    });
    passwordHasher.compare.mockResolvedValue(false);

    await expect(
      useCase.execute('42', {
        currentPassword: 'Temp1234',
        newPassword: 'NuevaClave123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(userRepository.updatePassword).not.toHaveBeenCalled();
  });
});
