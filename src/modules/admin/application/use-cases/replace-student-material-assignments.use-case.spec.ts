import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReplaceStudentMaterialAssignmentsUseCase } from './replace-student-material-assignments.use-case';
import { MaterialRepositoryPort } from '../../../materials/domain/ports/material-repository.port';
import { UserRepositoryPort } from '../../../users/domain/ports/user-repository.port';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';

describe('ReplaceStudentMaterialAssignmentsUseCase', () => {
  let materialRepository: jest.Mocked<MaterialRepositoryPort>;
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let useCase: ReplaceStudentMaterialAssignmentsUseCase;

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
      findCategoryById: jest.fn(),
      createCategory: jest.fn(),
      updateCategory: jest.fn(),
      deleteCategory: jest.fn(),
      categoryHasMaterials: jest.fn(),
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

    useCase = new ReplaceStudentMaterialAssignmentsUseCase(
      materialRepository,
      userRepository,
    );
  });

  it('replaces assignments when the payload is valid', async () => {
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
    materialRepository.findByIds.mockResolvedValue([
      {
        id: '10',
        title: 'Material 10',
        description: 'Description',
        published: true,
        viewed: null,
        category: { id: '1', key: 'theory', name: 'Theory' },
        links: [],
        createdById: '1',
        createdAt: new Date(),
      },
      {
        id: '11',
        title: 'Material 11',
        description: 'Description',
        published: false,
        viewed: null,
        category: { id: '1', key: 'theory', name: 'Theory' },
        links: [],
        createdById: '1',
        createdAt: new Date(),
      },
    ]);
    materialRepository.replaceStudentAssignments.mockResolvedValue([
      { materialId: '10', position: 0 },
      { materialId: '11', position: 1 },
    ]);

    const result = await useCase.execute('42', {
      assignments: [
        { materialId: '10', position: 0 },
        { materialId: '11', position: 1 },
      ],
    });

    expect(result).toEqual([
      { materialId: '10', position: 0 },
      { materialId: '11', position: 1 },
    ]);
    expect(materialRepository.findByIds).toHaveBeenCalledWith(['10', '11']);
    expect(materialRepository.replaceStudentAssignments).toHaveBeenCalledWith({
      studentId: '42',
      assignments: [
        { materialId: '10', position: 0 },
        { materialId: '11', position: 1 },
      ],
    });
  });

  it('throws when assignment positions are duplicated', async () => {
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

    await expect(
      useCase.execute('42', {
        assignments: [
          { materialId: '10', position: 0 },
          { materialId: '11', position: 0 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(materialRepository.findByIds).not.toHaveBeenCalled();
  });

  it('throws when one material does not exist', async () => {
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
    materialRepository.findByIds.mockResolvedValue([
      {
        id: '10',
        title: 'Material 10',
        description: 'Description',
        published: true,
        viewed: null,
        category: { id: '1', key: 'theory', name: 'Theory' },
        links: [],
        createdById: '1',
        createdAt: new Date(),
      },
    ]);

    await expect(
      useCase.execute('42', {
        assignments: [
          { materialId: '10', position: 0 },
          { materialId: '11', position: 1 },
        ],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(materialRepository.replaceStudentAssignments).not.toHaveBeenCalled();
  });
});
