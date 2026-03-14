import { NotFoundException } from '@nestjs/common';
import { GetAdminStudentUseCase } from './get-admin-student.use-case';
import { UserRepositoryPort } from '../../../users/domain/ports/user-repository.port';
import { ProgressRepositoryPort } from '../../../users/domain/ports/progress-repository.port';
import { AttemptReadRepositoryPort } from '../../../attempts/domain/ports/attempt-read-repository.port';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { AdminStudentInsightsRepositoryPort } from '../../domain/ports/admin-student-insights-repository.port';

describe('GetAdminStudentUseCase', () => {
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let progressRepository: jest.Mocked<ProgressRepositoryPort>;
  let attemptReadRepository: jest.Mocked<AttemptReadRepositoryPort>;
  let adminStudentInsightsRepository: jest.Mocked<AdminStudentInsightsRepositoryPort>;
  let useCase: GetAdminStudentUseCase;

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
    progressRepository = {
      getStudentProgress: jest.fn(),
    };
    attemptReadRepository = {
      findByStudentId: jest.fn(),
      findDetailById: jest.fn(),
    };
    adminStudentInsightsRepository = {
      findStudentNote: jest.fn(),
      saveStudentNote: jest.fn(),
      listStudentMaterialsProgress: jest.fn(),
    };

    useCase = new GetAdminStudentUseCase(
      userRepository,
      progressRepository,
      attemptReadRepository,
      adminStudentInsightsRepository,
    );
  });

  it('returns student detail with progress and aggregated attempt stats', async () => {
    userRepository.findById.mockResolvedValue({
      id: '42',
      email: 'student@example.com',
      fullName: 'Student Example',
      phone: '+5491112345678',
      profilePhotoUrl: 'https://cdn.example.com/photo.jpg',
      role: UserRole.STUDENT,
      passwordHash: 'hash',
      refreshTokenHash: null,
      mustChangePassword: false,
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
    });
    progressRepository.getStudentProgress.mockResolvedValue({
      materialsTotal: 5,
      materialsViewed: 3,
      examPassed: true,
      certificateIssued: false,
    });
    attemptReadRepository.findByStudentId.mockResolvedValue([
      {
        id: '102',
        examId: '9',
        examTitle: 'Final',
        score: 80,
        passed: true,
        createdAt: new Date('2026-03-10T12:00:00.000Z'),
      },
      {
        id: '101',
        examId: '9',
        examTitle: 'Final',
        score: 60,
        passed: false,
        createdAt: new Date('2026-03-05T12:00:00.000Z'),
      },
    ]);
    adminStudentInsightsRepository.findStudentNote.mockResolvedValue({
      content: 'Necesita refuerzo en prioridad de paso',
      updatedAt: new Date('2026-03-14T18:20:00.000Z'),
      updatedByName: 'Admin GMC',
    });

    const result = await useCase.execute('42');

    expect(result).toEqual({
      id: '42',
      fullName: 'Student Example',
      email: 'student@example.com',
      phone: '+5491112345678',
      profilePhotoUrl: 'https://cdn.example.com/photo.jpg',
      approved: true,
      lastAttemptScore: 80,
      note: {
        content: 'Necesita refuerzo en prioridad de paso',
        updatedAt: '2026-03-14T18:20:00.000Z',
        updatedByName: 'Admin GMC',
      },
      progress: {
        materialsTotal: 5,
        materialsViewed: 3,
        examPassed: true,
        certificateIssued: false,
      },
      stats: {
        totalAttempts: 2,
        passedAttempts: 1,
        failedAttempts: 1,
        bestScore: 80,
        averageScore: 70,
        lastAttemptAt: '2026-03-10T12:00:00.000Z',
        lastPassedAt: '2026-03-10T12:00:00.000Z',
      },
    });
  });

  it('returns null-based stats when the student has no attempts', async () => {
    userRepository.findById.mockResolvedValue({
      id: '42',
      email: 'student@example.com',
      fullName: 'Student Example',
      phone: null,
      profilePhotoUrl: null,
      role: UserRole.STUDENT,
      passwordHash: 'hash',
      refreshTokenHash: null,
      mustChangePassword: false,
      createdAt: new Date(),
    });
    progressRepository.getStudentProgress.mockResolvedValue({
      materialsTotal: 0,
      materialsViewed: 0,
      examPassed: false,
      certificateIssued: false,
    });
    attemptReadRepository.findByStudentId.mockResolvedValue([]);
    adminStudentInsightsRepository.findStudentNote.mockResolvedValue(null);

    const result = await useCase.execute('42');

    expect(result.approved).toBe(false);
    expect(result.lastAttemptScore).toBeNull();
    expect(result.note).toBeNull();
    expect(result.stats).toEqual({
      totalAttempts: 0,
      passedAttempts: 0,
      failedAttempts: 0,
      bestScore: null,
      averageScore: null,
      lastAttemptAt: null,
      lastPassedAt: null,
    });
  });

  it('throws when the target user is not a student', async () => {
    userRepository.findById.mockResolvedValue({
      id: '1',
      email: 'admin@example.com',
      fullName: 'Admin',
      phone: null,
      profilePhotoUrl: null,
      role: UserRole.ADMIN,
      passwordHash: 'hash',
      refreshTokenHash: null,
      mustChangePassword: false,
      createdAt: new Date(),
    });

    await expect(useCase.execute('1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(progressRepository.getStudentProgress).not.toHaveBeenCalled();
    expect(attemptReadRepository.findByStudentId).not.toHaveBeenCalled();
    expect(
      adminStudentInsightsRepository.findStudentNote,
    ).not.toHaveBeenCalled();
  });
});
