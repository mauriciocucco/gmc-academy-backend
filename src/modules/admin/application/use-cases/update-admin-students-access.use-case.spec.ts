import { NotFoundException } from '@nestjs/common';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { UserRepositoryPort } from '../../../users/domain/ports/user-repository.port';
import { UpdateAdminStudentsAccessUseCase } from './update-admin-students-access.use-case';

describe('UpdateAdminStudentsAccessUseCase', () => {
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let useCase: UpdateAdminStudentsAccessUseCase;

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

    useCase = new UpdateAdminStudentsAccessUseCase(userRepository);
  });

  it('blocks multiple students and returns their updated access state', async () => {
    userRepository.findByIds
      .mockResolvedValueOnce([
        {
          id: '42',
          email: 'one@example.com',
          fullName: 'Alumno Uno',
          phone: null,
          profilePhotoUrl: null,
          role: UserRole.STUDENT,
          passwordHash: 'hash',
          refreshTokenHash: null,
          mustChangePassword: false,
          blockedAt: null,
          blockedByUserId: null,
          blockReason: null,
          createdAt: new Date('2026-03-01T00:00:00.000Z'),
        },
        {
          id: '43',
          email: 'two@example.com',
          fullName: 'Alumno Dos',
          phone: null,
          profilePhotoUrl: null,
          role: UserRole.STUDENT,
          passwordHash: 'hash',
          refreshTokenHash: null,
          mustChangePassword: false,
          blockedAt: null,
          blockedByUserId: null,
          blockReason: null,
          createdAt: new Date('2026-03-01T00:00:00.000Z'),
        },
      ])
      .mockResolvedValueOnce([
        {
          id: '42',
          email: 'one@example.com',
          fullName: 'Alumno Uno',
          phone: null,
          profilePhotoUrl: null,
          role: UserRole.STUDENT,
          passwordHash: 'hash',
          refreshTokenHash: null,
          mustChangePassword: false,
          blockedAt: new Date('2026-03-14T19:00:00.000Z'),
          blockedByUserId: '1',
          blockReason: 'Pago pendiente',
          createdAt: new Date('2026-03-01T00:00:00.000Z'),
        },
        {
          id: '43',
          email: 'two@example.com',
          fullName: 'Alumno Dos',
          phone: null,
          profilePhotoUrl: null,
          role: UserRole.STUDENT,
          passwordHash: 'hash',
          refreshTokenHash: null,
          mustChangePassword: false,
          blockedAt: new Date('2026-03-14T19:00:00.000Z'),
          blockedByUserId: '1',
          blockReason: 'Pago pendiente',
          createdAt: new Date('2026-03-01T00:00:00.000Z'),
        },
      ]);

    const result = await useCase.execute('1', {
      studentIds: ['42', '43'],
      blocked: true,
      reason: 'Pago pendiente',
    });

    expect(userRepository.updateAccessStatus).toHaveBeenCalledWith({
      userIds: ['42', '43'],
      blocked: true,
      blockedByUserId: '1',
      reason: 'Pago pendiente',
    });
    expect(result).toEqual({
      items: [
        {
          id: '42',
          blocked: true,
          blockedAt: '2026-03-14T19:00:00.000Z',
          blockReason: 'Pago pendiente',
        },
        {
          id: '43',
          blocked: true,
          blockedAt: '2026-03-14T19:00:00.000Z',
          blockReason: 'Pago pendiente',
        },
      ],
    });
  });

  it('throws when any provided user is not a student', async () => {
    userRepository.findByIds.mockResolvedValue([
      {
        id: '1',
        email: 'admin@example.com',
        fullName: 'Admin',
        phone: null,
        profilePhotoUrl: null,
        role: UserRole.ADMIN,
        passwordHash: 'hash',
        refreshTokenHash: null,
        mustChangePassword: false,
        blockedAt: null,
        blockedByUserId: null,
        blockReason: null,
        createdAt: new Date(),
      },
    ]);

    await expect(
      useCase.execute('1', {
        studentIds: ['1'],
        blocked: true,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(userRepository.updateAccessStatus).not.toHaveBeenCalled();
  });
});
