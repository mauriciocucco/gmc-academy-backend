import { NotFoundException } from '@nestjs/common';
import { ListAdminExamQuestionsUseCase } from './list-admin-exam-questions.use-case';
import { ExamReadRepositoryPort } from '../../domain/ports/exam-read-repository.port';

describe('ListAdminExamQuestionsUseCase', () => {
  let examReadRepository: jest.Mocked<ExamReadRepositoryPort>;
  let useCase: ListAdminExamQuestionsUseCase;

  beforeEach(() => {
    examReadRepository = {
      findActive: jest.fn(),
      findActiveMany: jest.fn(),
      listActiveQuestions: jest.fn(),
      findById: jest.fn(),
    };

    useCase = new ListAdminExamQuestionsUseCase(examReadRepository);
  });

  it('returns a paginated list of active exam questions', async () => {
    examReadRepository.listActiveQuestions.mockResolvedValue({
      examId: '9',
      title: 'Final',
      description: 'Config actual',
      passScore: 70,
      updatedAt: new Date('2026-03-15T11:00:00.000Z'),
      updatedByName: 'Admin GMC',
      items: [
        {
          id: '12',
          questionText: 'Pregunta 2',
          correctOption: 'b',
          position: 2,
          options: [
            { id: 'a', label: 'Opcion A' },
            { id: 'b', label: 'Opcion B' },
          ],
        },
        {
          id: '11',
          questionText: 'Pregunta 1',
          correctOption: 'c',
          position: 1,
          options: [
            { id: 'c', label: 'Opcion C' },
            { id: 'd', label: 'Opcion D' },
          ],
        },
      ],
      meta: {
        page: 1,
        pageSize: 2,
        totalItems: 5,
        totalPages: 3,
      },
    });

    const result = await useCase.execute({
      page: 1,
      pageSize: 2,
      search: 'pregunta',
    });

    expect(examReadRepository.listActiveQuestions).toHaveBeenCalledWith({
      page: 1,
      pageSize: 2,
      search: 'pregunta',
    });
    expect(result).toEqual({
      examId: '9',
      title: 'Final',
      description: 'Config actual',
      passScore: 70,
      updatedAt: '2026-03-15T11:00:00.000Z',
      updatedByName: 'Admin GMC',
      items: [
        {
          id: '11',
          text: 'Pregunta 1',
          position: 1,
          options: [
            { id: 'c', label: 'Opcion C', isCorrect: true },
            { id: 'd', label: 'Opcion D', isCorrect: false },
          ],
        },
        {
          id: '12',
          text: 'Pregunta 2',
          position: 2,
          options: [
            { id: 'a', label: 'Opcion A', isCorrect: false },
            { id: 'b', label: 'Opcion B', isCorrect: true },
          ],
        },
      ],
      meta: {
        page: 1,
        pageSize: 2,
        totalItems: 5,
        totalPages: 3,
      },
    });
  });

  it('throws when there is no active exam', async () => {
    examReadRepository.listActiveQuestions.mockResolvedValue(null);

    await expect(
      useCase.execute({
        page: 1,
        pageSize: 10,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
