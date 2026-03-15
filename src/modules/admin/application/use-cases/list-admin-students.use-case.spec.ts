import { ListAdminStudentsUseCase } from './list-admin-students.use-case';
import {
  AdminReadRepositoryPort,
  AdminStudentListResult,
} from '../../domain/ports/admin-read-repository.port';

describe('ListAdminStudentsUseCase', () => {
  let adminReadRepository: jest.Mocked<AdminReadRepositoryPort>;
  let useCase: ListAdminStudentsUseCase;

  beforeEach(() => {
    adminReadRepository = {
      listStudentsWithLatestAttempt: jest.fn(),
      getStats: jest.fn(),
      getPerformance: jest.fn(),
    };

    useCase = new ListAdminStudentsUseCase(adminReadRepository);
  });

  it('forwards pagination and filters to the repository', async () => {
    const expected: AdminStudentListResult = {
      items: [
        {
          id: '42',
          fullName: 'Lucia Fernandez',
          email: 'lucia@example.com',
          lastAttemptScore: 92,
          approved: true,
          blocked: false,
          blockedAt: null,
        },
      ],
      meta: {
        page: 2,
        pageSize: 5,
        totalItems: 11,
        totalPages: 3,
      },
    };
    adminReadRepository.listStudentsWithLatestAttempt.mockResolvedValue(
      expected,
    );

    const result = await useCase.execute({
      page: 2,
      pageSize: 5,
        search: 'lucia',
        status: 'approved',
        attemptState: 'with-attempt',
        accessStatus: 'active',
      });

    expect(result).toEqual(expected);
    expect(adminReadRepository.listStudentsWithLatestAttempt).toHaveBeenCalledWith(
      {
        page: 2,
        pageSize: 5,
        search: 'lucia',
        status: 'approved',
        attemptState: 'with-attempt',
        accessStatus: 'active',
      },
    );
  });
});
