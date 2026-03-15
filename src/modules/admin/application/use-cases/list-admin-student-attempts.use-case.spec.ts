import { NotFoundException } from '@nestjs/common';
import { ListAdminStudentAttemptsUseCase } from './list-admin-student-attempts.use-case';
import { UserRepositoryPort } from '../../../users/domain/ports/user-repository.port';
import { AttemptReadRepositoryPort } from '../../../attempts/domain/ports/attempt-read-repository.port';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';

describe('ListAdminStudentAttemptsUseCase', () => {
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let attemptReadRepository: jest.Mocked<AttemptReadRepositoryPort>;
  let useCase: ListAdminStudentAttemptsUseCase;

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
    attemptReadRepository = {
      findByStudentId: jest.fn(),
      findDetailById: jest.fn(),
    };

    useCase = new ListAdminStudentAttemptsUseCase(
      userRepository,
      attemptReadRepository,
    );
  });

  it('lists attempts for the student', async () => {
    userRepository.findById.mockResolvedValue({
      id: '42',
      email: 'student@example.com',
      fullName: 'Student',
      phone: null,
      profilePhotoUrl: null,
      role: UserRole.STUDENT,
      passwordHash: 'hash',
      refreshTokenHash: null,
      mustChangePassword: false,
      createdAt: new Date(),
    });
    attemptReadRepository.findByStudentId.mockResolvedValue([
      {
        id: '100',
        examId: '9',
        examTitle: 'Simulacro 1',
        score: 82,
        passed: true,
        createdAt: new Date('2026-03-12T15:30:00.000Z'),
      },
    ]);

    await expect(useCase.execute('42')).resolves.toEqual([
      {
        id: '100',
        examId: '9',
        examTitle: 'Simulacro 1',
        score: 82,
        passed: true,
        createdAt: '2026-03-12T15:30:00.000Z',
      },
    ]);
  });

  it('throws when the target user is not a student', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('42')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(attemptReadRepository.findByStudentId).not.toHaveBeenCalled();
  });
});
