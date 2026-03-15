import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { TokenServicePort } from '../../domain/ports/token-service.port';
import { RefreshSessionUseCase } from './refresh-session.use-case';
import { UserRepositoryPort } from '../../../users/domain/ports/user-repository.port';

describe('RefreshSessionUseCase', () => {
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;
  let tokenService: jest.Mocked<TokenServicePort>;
  let useCase: RefreshSessionUseCase;

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

    useCase = new RefreshSessionUseCase(
      tokenService,
      userRepository,
      passwordHasher,
    );
  });

  it('rejects blocked users and clears their refresh hash', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({
      sub: '42',
      email: 'student@example.com',
      role: UserRole.STUDENT,
    });
    userRepository.findById.mockResolvedValue({
      id: '42',
      email: 'student@example.com',
      fullName: 'Alumno Demo',
      phone: null,
      profilePhotoUrl: null,
      role: UserRole.STUDENT,
      passwordHash: 'hash',
      refreshTokenHash: 'refresh-hash',
      mustChangePassword: false,
      blockedAt: new Date('2026-03-14T20:10:00.000Z'),
      blockedByUserId: '1',
      blockReason: 'Pago pendiente',
      createdAt: new Date(),
    });

    await expect(
      useCase.execute({
        refreshToken: 'refresh-token',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(userRepository.clearRefreshTokenHash).toHaveBeenCalledWith('42');
    expect(tokenService.signAccessToken).not.toHaveBeenCalled();
  });

  it('rejects invalid refresh sessions', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({
      sub: '42',
      email: 'student@example.com',
      role: UserRole.STUDENT,
    });
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        refreshToken: 'refresh-token',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
