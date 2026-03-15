import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { UserRepositoryPort } from '../../../../modules/users/domain/ports/user-repository.port';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let guard: JwtAuthGuard;

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;
    configService = {
      getOrThrow: jest.fn().mockReturnValue('secret'),
    } as unknown as jest.Mocked<ConfigService>;
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

    guard = new JwtAuthGuard(jwtService, configService, userRepository);
  });

  it('rejects blocked users even with a valid access token', async () => {
    jwtService.verifyAsync.mockResolvedValue({
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
      refreshTokenHash: null,
      mustChangePassword: false,
      blockedAt: new Date('2026-03-14T20:20:00.000Z'),
      blockedByUserId: '1',
      blockReason: 'Pago pendiente',
      createdAt: new Date(),
    });

    const request = {
      headers: {
        authorization: 'Bearer token',
      },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('rejects tokens for missing users', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: '42',
      email: 'student@example.com',
      role: UserRole.STUDENT,
    });
    userRepository.findById.mockResolvedValue(null);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer token',
          },
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
