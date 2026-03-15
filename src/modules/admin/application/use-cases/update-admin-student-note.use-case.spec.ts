import { NotFoundException } from '@nestjs/common';
import { UpdateAdminStudentNoteUseCase } from './update-admin-student-note.use-case';
import { UserRepositoryPort } from '../../../users/domain/ports/user-repository.port';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { AdminStudentInsightsRepositoryPort } from '../../domain/ports/admin-student-insights-repository.port';

describe('UpdateAdminStudentNoteUseCase', () => {
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let adminStudentInsightsRepository: jest.Mocked<AdminStudentInsightsRepositoryPort>;
  let useCase: UpdateAdminStudentNoteUseCase;

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

    useCase = new UpdateAdminStudentNoteUseCase(
      userRepository,
      adminStudentInsightsRepository,
    );
  });

  it('saves the note for a valid student and admin user', async () => {
    userRepository.findById
      .mockResolvedValueOnce({
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
      })
      .mockResolvedValueOnce({
        id: '7',
        email: 'admin@example.com',
        fullName: 'Admin GMC',
        phone: null,
        profilePhotoUrl: null,
        role: UserRole.ADMIN,
        passwordHash: 'hash',
        refreshTokenHash: null,
        mustChangePassword: false,
        createdAt: new Date(),
      });
    adminStudentInsightsRepository.saveStudentNote.mockResolvedValue({
      content: 'Nueva nota interna',
      updatedAt: new Date('2026-03-14T18:20:00.000Z'),
      updatedByName: 'Admin GMC',
    });

    const result = await useCase.execute('42', '7', {
      content: 'Nueva nota interna',
    });

    expect(adminStudentInsightsRepository.saveStudentNote).toHaveBeenCalledWith(
      {
        studentId: '42',
        content: 'Nueva nota interna',
        updatedById: '7',
      },
    );
    expect(result).toEqual({
      content: 'Nueva nota interna',
      updatedAt: new Date('2026-03-14T18:20:00.000Z'),
      updatedByName: 'Admin GMC',
    });
  });

  it('throws when the target user is not a student', async () => {
    userRepository.findById
      .mockResolvedValueOnce({
        id: '42',
        email: 'admin@example.com',
        fullName: 'Admin',
        phone: null,
        profilePhotoUrl: null,
        role: UserRole.ADMIN,
        passwordHash: 'hash',
        refreshTokenHash: null,
        mustChangePassword: false,
        createdAt: new Date(),
      })
      .mockResolvedValueOnce({
        id: '7',
        email: 'admin@example.com',
        fullName: 'Admin GMC',
        phone: null,
        profilePhotoUrl: null,
        role: UserRole.ADMIN,
        passwordHash: 'hash',
        refreshTokenHash: null,
        mustChangePassword: false,
        createdAt: new Date(),
      });

    await expect(
      useCase.execute('42', '7', { content: 'Nueva nota interna' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(
      adminStudentInsightsRepository.saveStudentNote,
    ).not.toHaveBeenCalled();
  });

  it('throws when the authenticated admin user does not exist', async () => {
    userRepository.findById
      .mockResolvedValueOnce({
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
      })
      .mockResolvedValueOnce(null);

    await expect(
      useCase.execute('42', '7', { content: 'Nueva nota interna' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(
      adminStudentInsightsRepository.saveStudentNote,
    ).not.toHaveBeenCalled();
  });
});
