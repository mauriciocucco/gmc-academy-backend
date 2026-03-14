import { BadRequestException } from '@nestjs/common';
import { UpdateAdminExamConfigUseCase } from './update-admin-exam-config.use-case';
import { ExamManagementRepositoryPort } from '../../domain/ports/exam-management-repository.port';

describe('UpdateAdminExamConfigUseCase', () => {
  let examManagementRepository: jest.Mocked<ExamManagementRepositoryPort>;
  let useCase: UpdateAdminExamConfigUseCase;

  beforeEach(() => {
    examManagementRepository = {
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      saveActiveConfig: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new UpdateAdminExamConfigUseCase(examManagementRepository);
  });

  it('saves the active config and returns the persisted contract', async () => {
    examManagementRepository.saveActiveConfig.mockResolvedValue({
      id: '9',
      title: 'Final',
      description: 'Config actual',
      passScore: 80,
      isActive: true,
      createdAt: new Date('2026-03-14T18:00:00.000Z'),
      updatedAt: new Date('2026-03-14T19:00:00.000Z'),
      updatedByName: 'Admin GMC',
      questions: [
        {
          id: '15',
          questionText: 'Pregunta',
          correctOption: 'b',
          position: 1,
          options: [
            { id: 'a', label: 'Opcion A' },
            { id: 'b', label: 'Opcion B' },
          ],
        },
      ],
    });

    const result = await useCase.execute('7', {
      title: ' Final ',
      description: ' Config actual ',
      passScore: 80,
      questions: [
        {
          id: '15',
          text: ' Pregunta ',
          position: 1,
          options: [
            { id: 'a', label: ' Opcion A ', isCorrect: false },
            { id: 'b', label: ' Opcion B ', isCorrect: true },
          ],
        },
      ],
    });

    expect(examManagementRepository.saveActiveConfig).toHaveBeenCalledWith({
      title: 'Final',
      description: 'Config actual',
      passScore: 80,
      updatedById: '7',
      questions: [
        {
          id: '15',
          questionText: 'Pregunta',
          position: 1,
          options: [
            { id: 'a', label: 'Opcion A', isCorrect: false },
            { id: 'b', label: 'Opcion B', isCorrect: true },
          ],
        },
      ],
    });
    expect(result).toEqual({
      id: '9',
      title: 'Final',
      description: 'Config actual',
      passScore: 80,
      updatedAt: '2026-03-14T19:00:00.000Z',
      updatedByName: 'Admin GMC',
      questions: [
        {
          id: '15',
          text: 'Pregunta',
          position: 1,
          options: [
            { id: 'a', label: 'Opcion A', isCorrect: false },
            { id: 'b', label: 'Opcion B', isCorrect: true },
          ],
        },
      ],
    });
  });

  it('throws when a question has multiple correct options', async () => {
    await expect(
      useCase.execute('7', {
        title: 'Final',
        description: 'Config actual',
        passScore: 80,
        questions: [
          {
            text: 'Pregunta',
            position: 1,
            options: [
              { label: 'Opcion A', isCorrect: true },
              { label: 'Opcion B', isCorrect: true },
            ],
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(examManagementRepository.saveActiveConfig).not.toHaveBeenCalled();
  });
});
