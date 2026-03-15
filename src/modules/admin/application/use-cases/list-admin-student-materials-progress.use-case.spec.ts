import { NotFoundException } from '@nestjs/common';
import { ListAdminStudentMaterialsProgressUseCase } from './list-admin-student-materials-progress.use-case';
import { UserRepositoryPort } from '../../../users/domain/ports/user-repository.port';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { AdminStudentInsightsRepositoryPort } from '../../domain/ports/admin-student-insights-repository.port';

describe('ListAdminStudentMaterialsProgressUseCase', () => {
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let adminStudentInsightsRepository: jest.Mocked<AdminStudentInsightsRepositoryPort>;
  let useCase: ListAdminStudentMaterialsProgressUseCase;

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
    adminStudentInsightsRepository = {
      findStudentNote: jest.fn(),
      saveStudentNote: jest.fn(),
      listStudentMaterialsProgress: jest.fn(),
    };

    useCase = new ListAdminStudentMaterialsProgressUseCase(
      userRepository,
      adminStudentInsightsRepository,
    );
  });

  it('returns the assigned materials progress for a valid student', async () => {
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
    adminStudentInsightsRepository.listStudentMaterialsProgress.mockResolvedValue(
      [
        {
          materialId: 'mat_1',
          title: 'Prioridad de paso',
          description: 'Conceptos base',
          category: {
            id: '1',
            key: 'teoria',
            name: 'Teoria',
          },
          position: 1,
          viewed: true,
          viewedAt: new Date('2026-03-10T12:00:00.000Z'),
          linksCount: 2,
        },
      ],
    );

    const result = await useCase.execute('42');

    expect(
      adminStudentInsightsRepository.listStudentMaterialsProgress,
    ).toHaveBeenCalledWith('42');
    expect(result).toEqual([
      {
        materialId: 'mat_1',
        title: 'Prioridad de paso',
        description: 'Conceptos base',
        category: {
          id: '1',
          key: 'teoria',
          name: 'Teoria',
        },
        position: 1,
        viewed: true,
        viewedAt: new Date('2026-03-10T12:00:00.000Z'),
        linksCount: 2,
      },
    ]);
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
    expect(
      adminStudentInsightsRepository.listStudentMaterialsProgress,
    ).not.toHaveBeenCalled();
  });
});
