import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { TokenServicePort } from '../../domain/ports/token-service.port';
import { LoginUseCase } from './login.use-case';
import { UserRepositoryPort } from '../../../users/domain/ports/user-repository.port';

describe('LoginUseCase', () => {
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;
  let tokenService: jest.Mocked<TokenServicePort>;
  let useCase: LoginUseCase;

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
    tokenService = {
      signAccessToken: jest.fn(),
      signRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    useCase = new LoginUseCase(userRepository, passwordHasher, tokenService);
  });

  it('rejects blocked users after validating credentials', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: '42',
      email: 'student@example.com',
      fullName: 'Alumno Demo',
      phone: null,
      profilePhotoUrl: null,
      role: UserRole.STUDENT,
      passwordHash: 'hash',
      refreshTokenHash: null,
      mustChangePassword: false,
      blockedAt: new Date('2026-03-14T20:00:00.000Z'),
      blockedByUserId: '1',
      blockReason: 'Pago pendiente',
      createdAt: new Date(),
    });
    passwordHasher.compare.mockResolvedValue(true);

    await expect(
      useCase.execute({
        email: 'student@example.com',
        password: 'secret',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(tokenService.signAccessToken).not.toHaveBeenCalled();
    expect(userRepository.saveRefreshTokenHash).not.toHaveBeenCalled();
  });

  it('rejects invalid credentials', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'student@example.com',
        password: 'secret',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
