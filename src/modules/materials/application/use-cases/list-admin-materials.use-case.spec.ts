import { ListAdminMaterialsUseCase } from './list-admin-materials.use-case';
import { MaterialRepositoryPort } from '../../domain/ports/material-repository.port';
import { MaterialLinkSource } from '../../../../common/domain/enums/material-link-source.enum';

describe('ListAdminMaterialsUseCase', () => {
  let materialRepository: jest.Mocked<MaterialRepositoryPort>;
  let useCase: ListAdminMaterialsUseCase;

  beforeEach(() => {
    materialRepository = {
      findAll: jest.fn(),
      findAssignedToStudent: jest.fn(),
      listForAdmin: jest.fn(),
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

    useCase = new ListAdminMaterialsUseCase(materialRepository);
  });

  it('returns paginated materials mapped to the frontend contract', async () => {
    materialRepository.listForAdmin.mockResolvedValue({
      items: [
        {
          id: '8',
          title: 'Normativa',
          description: 'Clase teorica',
          published: false,
          viewed: null,
          createdById: '2',
          createdAt: new Date('2026-03-15T10:00:00.000Z'),
          category: {
            id: '3',
            key: 'theory',
            name: 'Teoria',
          },
          links: [
            {
              id: '20',
              sourceType: MaterialLinkSource.YOUTUBE,
              url: 'https://youtu.be/demo',
              label: 'Video',
              position: 2,
            },
            {
              id: '19',
              sourceType: MaterialLinkSource.DRIVE,
              url: 'https://drive.google.com/file/d/demo',
              label: 'PDF',
              position: 1,
            },
          ],
        },
      ],
      meta: {
        page: 2,
        pageSize: 1,
        totalItems: 3,
        totalPages: 3,
      },
    });

    const result = await useCase.execute({
      page: 2,
      pageSize: 1,
      search: 'norma',
      categoryId: '3',
      publishedStatus: 'draft',
    });

    expect(materialRepository.listForAdmin).toHaveBeenCalledWith({
      page: 2,
      pageSize: 1,
      search: 'norma',
      categoryId: '3',
      publishedStatus: 'draft',
    });
    expect(result).toEqual({
      items: [
        {
          id: '8',
          title: 'Normativa',
          description: 'Clase teorica',
          published: false,
          publishedAt: '2026-03-15',
          viewed: null,
          createdById: '2',
          category: {
            id: '3',
            key: 'theory',
            name: 'Teoria',
          },
          links: [
            {
              id: '19',
              sourceType: 'drive',
              url: 'https://drive.google.com/file/d/demo',
              label: 'PDF',
              position: 1,
            },
            {
              id: '20',
              sourceType: 'youtube',
              url: 'https://youtu.be/demo',
              label: 'Video',
              position: 2,
            },
          ],
        },
      ],
      meta: {
        page: 2,
        pageSize: 1,
        totalItems: 3,
        totalPages: 3,
      },
    });
  });
});
