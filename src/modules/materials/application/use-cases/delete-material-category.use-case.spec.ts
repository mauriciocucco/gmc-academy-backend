import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DeleteMaterialCategoryUseCase } from './delete-material-category.use-case';
import { MaterialRepositoryPort } from '../../domain/ports/material-repository.port';

describe('DeleteMaterialCategoryUseCase', () => {
  let materialRepository: jest.Mocked<MaterialRepositoryPort>;
  let useCase: DeleteMaterialCategoryUseCase;

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

    useCase = new DeleteMaterialCategoryUseCase(materialRepository);
  });

  it('deletes a category without materials assigned', async () => {
    materialRepository.findCategoryById.mockResolvedValue({
      id: '7',
      key: 'theory',
      name: 'Theory',
    });
    materialRepository.categoryHasMaterials.mockResolvedValue(false);
    materialRepository.deleteCategory.mockResolvedValue();

    await useCase.execute('7');

    expect(materialRepository.categoryHasMaterials).toHaveBeenCalledWith('7');
    expect(materialRepository.deleteCategory).toHaveBeenCalledWith('7');
  });

  it('throws when the category does not exist', async () => {
    materialRepository.findCategoryById.mockResolvedValue(null);

    await expect(useCase.execute('7')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(materialRepository.deleteCategory).not.toHaveBeenCalled();
  });

  it('throws when the category still has materials', async () => {
    materialRepository.findCategoryById.mockResolvedValue({
      id: '7',
      key: 'theory',
      name: 'Theory',
    });
    materialRepository.categoryHasMaterials.mockResolvedValue(true);

    await expect(useCase.execute('7')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(materialRepository.deleteCategory).not.toHaveBeenCalled();
  });
});
