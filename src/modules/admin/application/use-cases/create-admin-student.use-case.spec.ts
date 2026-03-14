import { ConflictException } from '@nestjs/common';
import { CreateAdminStudentUseCase } from './create-admin-student.use-case';
import { UserRepositoryPort } from '../../../users/domain/ports/user-repository.port';
import { PasswordHasherPort } from '../../../auth/domain/ports/password-hasher.port';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';

describe('CreateAdminStudentUseCase', () => {
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;
  let useCase: CreateAdminStudentUseCase;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      saveRefreshTokenHash: jest.fn(),
      clearRefreshTokenHash: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
      updateProfilePhoto: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    useCase = new CreateAdminStudentUseCase(userRepository, passwordHasher);
  });

  it('creates a student with a generated temporary password', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue('hashed-temp-password');
    userRepository.create.mockImplementation(async (payload) => ({
      id: '42',
      email: payload.email,
      fullName: payload.fullName,
      phone: payload.phone ?? null,
      profilePhotoUrl: null,
      role: payload.role,
      passwordHash: payload.passwordHash,
      refreshTokenHash: null,
      mustChangePassword: payload.mustChangePassword ?? false,
      createdAt: new Date('2026-03-14T18:30:00.000Z'),
    }));

    const result = await useCase.execute({
      fullName: 'Juan Perez',
      email: 'juan@email.com',
      phone: '+5491122334455',
    });

    expect(result).toMatchObject({
      id: '42',
      fullName: 'Juan Perez',
      email: 'juan@email.com',
      phone: '+5491122334455',
      mustChangePassword: true,
    });
    expect(result.temporaryPassword).toHaveLength(10);
    expect(result.temporaryPassword).toMatch(/[A-Z]/);
    expect(result.temporaryPassword).toMatch(/[a-z]/);
    expect(result.temporaryPassword).toMatch(/[0-9]/);
    expect(passwordHasher.hash).toHaveBeenCalledWith(result.temporaryPassword);
    expect(userRepository.create).toHaveBeenCalledWith({
      email: 'juan@email.com',
      fullName: 'Juan Perez',
      phone: '+5491122334455',
      passwordHash: 'hashed-temp-password',
      role: UserRole.STUDENT,
      mustChangePassword: true,
    });
  });

  it('rejects duplicate emails', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: '42',
      email: 'juan@email.com',
      fullName: 'Juan Perez',
      phone: null,
      profilePhotoUrl: null,
      role: UserRole.STUDENT,
      passwordHash: 'hash',
      refreshTokenHash: null,
      mustChangePassword: false,
      createdAt: new Date(),
    });

    await expect(
      useCase.execute({
        fullName: 'Juan Perez',
        email: 'juan@email.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
