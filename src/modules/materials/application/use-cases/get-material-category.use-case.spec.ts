import { NotFoundException } from '@nestjs/common';
import { GetMaterialCategoryUseCase } from './get-material-category.use-case';
import { MaterialRepositoryPort } from '../../domain/ports/material-repository.port';

describe('GetMaterialCategoryUseCase', () => {
  let materialRepository: jest.Mocked<MaterialRepositoryPort>;
  let useCase: GetMaterialCategoryUseCase;

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

    useCase = new GetMaterialCategoryUseCase(materialRepository);
  });

  it('returns the requested category', async () => {
    materialRepository.findCategoryById.mockResolvedValue({
      id: '7',
      key: 'theory',
      name: 'Theory',
    });

    const result = await useCase.execute('7');

    expect(result).toEqual({
      id: '7',
      key: 'theory',
      name: 'Theory',
    });
    expect(materialRepository.findCategoryById).toHaveBeenCalledWith('7');
  });

  it('throws when the category does not exist', async () => {
    materialRepository.findCategoryById.mockResolvedValue(null);

    await expect(useCase.execute('7')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
