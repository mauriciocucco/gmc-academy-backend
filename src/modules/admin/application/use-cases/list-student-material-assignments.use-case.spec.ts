import { NotFoundException } from '@nestjs/common';
import { ListStudentMaterialAssignmentsUseCase } from './list-student-material-assignments.use-case';
import { MaterialRepositoryPort } from '../../../materials/domain/ports/material-repository.port';
import { UserRepositoryPort } from '../../../users/domain/ports/user-repository.port';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';

describe('ListStudentMaterialAssignmentsUseCase', () => {
  let materialRepository: jest.Mocked<MaterialRepositoryPort>;
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let useCase: ListStudentMaterialAssignmentsUseCase;

  beforeEach(() => {
    materialRepository = {
      findAll: jest.fn(),
      findAssignedToStudent: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      listCategories: jest.fn(),
      createCategory: jest.fn(),
      listStudentAssignments: jest.fn(),
      replaceStudentAssignments: jest.fn(),
      setStudentAccess: jest.fn(),
      hasStudentAccessToMaterial: jest.fn(),
      markAsViewed: jest.fn(),
      unmarkAsViewed: jest.fn(),
      countAssignedAndViewedForStudent: jest.fn(),
    };
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

    useCase = new ListStudentMaterialAssignmentsUseCase(
      materialRepository,
      userRepository,
    );
  });

  it('returns the stored assignments for a student', async () => {
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
    materialRepository.listStudentAssignments.mockResolvedValue([
      { materialId: '10', position: 0 },
      { materialId: '11', position: 1 },
    ]);

    const result = await useCase.execute('42');

    expect(result).toEqual([
      { materialId: '10', position: 0 },
      { materialId: '11', position: 1 },
    ]);
    expect(materialRepository.listStudentAssignments).toHaveBeenCalledWith(
      '42',
    );
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
    expect(materialRepository.listStudentAssignments).not.toHaveBeenCalled();
  });
});
