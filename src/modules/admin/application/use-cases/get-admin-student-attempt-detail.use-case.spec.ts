import { NotFoundException } from '@nestjs/common';
import { GetAdminStudentAttemptDetailUseCase } from './get-admin-student-attempt-detail.use-case';
import { UserRepositoryPort } from '../../../users/domain/ports/user-repository.port';
import { AttemptReadRepositoryPort } from '../../../attempts/domain/ports/attempt-read-repository.port';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';

describe('GetAdminStudentAttemptDetailUseCase', () => {
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let attemptReadRepository: jest.Mocked<AttemptReadRepositoryPort>;
  let useCase: GetAdminStudentAttemptDetailUseCase;

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
    attemptReadRepository = {
      findByStudentId: jest.fn(),
      findDetailById: jest.fn(),
    };

    useCase = new GetAdminStudentAttemptDetailUseCase(
      userRepository,
      attemptReadRepository,
    );
  });

  it('returns the detailed review snapshot for an attempt', async () => {
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
    attemptReadRepository.findDetailById.mockResolvedValue({
      id: '100',
      examId: '9',
      examTitle: 'Simulacro 1',
      score: 50,
      passed: false,
      createdAt: new Date('2026-03-12T15:30:00.000Z'),
      questions: [
        {
          questionId: 'q1',
          questionText: 'Question 1',
          position: 2,
          options: [
            { id: 'a', label: 'Option A' },
            { id: 'b', label: 'Option B' },
          ],
          selectedOptionId: 'a',
          correctOptionId: 'b',
          isCorrect: false,
        },
        {
          questionId: 'q0',
          questionText: 'Question 0',
          position: 1,
          options: [{ id: 'c', label: 'Option C' }],
          selectedOptionId: null,
          correctOptionId: 'c',
          isCorrect: false,
        },
      ],
    });

    await expect(useCase.execute('42', '100')).resolves.toEqual({
      id: '100',
      examId: '9',
      examTitle: 'Simulacro 1',
      score: 50,
      passed: false,
      createdAt: '2026-03-12T15:30:00.000Z',
      correctAnswers: 0,
      totalQuestions: 2,
      questions: [
        {
          questionId: 'q0',
          questionText: 'Question 0',
          position: 1,
          options: [{ id: 'c', label: 'Option C' }],
          selectedOptionId: null,
          selectedOptionLabel: null,
          correctOptionId: 'c',
          correctOptionLabel: 'Option C',
          isCorrect: false,
        },
        {
          questionId: 'q1',
          questionText: 'Question 1',
          position: 2,
          options: [
            { id: 'a', label: 'Option A' },
            { id: 'b', label: 'Option B' },
          ],
          selectedOptionId: 'a',
          selectedOptionLabel: 'Option A',
          correctOptionId: 'b',
          correctOptionLabel: 'Option B',
          isCorrect: false,
        },
      ],
    });
  });

  it('throws when the attempt does not exist for the student', async () => {
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
    attemptReadRepository.findDetailById.mockResolvedValue(null);

    await expect(useCase.execute('42', '100')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
