import { NotFoundException } from '@nestjs/common';
import { GetAdminExamConfigUseCase } from './get-admin-exam-config.use-case';
import { ExamReadRepositoryPort } from '../../domain/ports/exam-read-repository.port';

describe('GetAdminExamConfigUseCase', () => {
  let examReadRepository: jest.Mocked<ExamReadRepositoryPort>;
  let useCase: GetAdminExamConfigUseCase;

  beforeEach(() => {
    examReadRepository = {
      findActive: jest.fn(),
      findActiveMany: jest.fn(),
      findById: jest.fn(),
    };

    useCase = new GetAdminExamConfigUseCase(examReadRepository);
  });

  it('returns the active exam config with isCorrect flags', async () => {
    examReadRepository.findActive.mockResolvedValue({
      id: '9',
      title: 'Final',
      description: 'Config actual',
      passScore: 70,
      isActive: true,
      createdAt: new Date('2026-03-14T18:00:00.000Z'),
      updatedAt: new Date('2026-03-14T19:00:00.000Z'),
      updatedByName: 'Admin GMC',
      questions: [
        {
          id: '11',
          questionText: 'Pregunta 1',
          correctOption: 'b',
          position: 2,
          options: [
            { id: 'a', label: 'Opcion A' },
            { id: 'b', label: 'Opcion B' },
          ],
        },
        {
          id: '10',
          questionText: 'Pregunta 0',
          correctOption: 'c',
          position: 1,
          options: [
            { id: 'c', label: 'Opcion C' },
            { id: 'd', label: 'Opcion D' },
          ],
        },
      ],
    });

    const result = await useCase.execute();

    expect(result).toEqual({
      id: '9',
      title: 'Final',
      description: 'Config actual',
      passScore: 70,
      updatedAt: '2026-03-14T19:00:00.000Z',
      updatedByName: 'Admin GMC',
      questions: [
        {
          id: '10',
          text: 'Pregunta 0',
          position: 1,
          options: [
            { id: 'c', label: 'Opcion C', isCorrect: true },
            { id: 'd', label: 'Opcion D', isCorrect: false },
          ],
        },
        {
          id: '11',
          text: 'Pregunta 1',
          position: 2,
          options: [
            { id: 'a', label: 'Opcion A', isCorrect: false },
            { id: 'b', label: 'Opcion B', isCorrect: true },
          ],
        },
      ],
    });
  });

  it('throws when there is no active exam', async () => {
    examReadRepository.findActive.mockResolvedValue(null);

    await expect(useCase.execute()).rejects.toBeInstanceOf(NotFoundException);
  });
});
