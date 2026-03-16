import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateMaterialCategoryUseCase } from './update-material-category.use-case';
import { MaterialRepositoryPort } from '../../domain/ports/material-repository.port';

describe('UpdateMaterialCategoryUseCase', () => {
  let materialRepository: jest.Mocked<MaterialRepositoryPort>;
  let useCase: UpdateMaterialCategoryUseCase;

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

    useCase = new UpdateMaterialCategoryUseCase(materialRepository);
  });

  it('updates the requested category', async () => {
    materialRepository.updateCategory.mockResolvedValue({
      id: '7',
      key: 'backend',
      name: 'Backend',
    });

    const result = await useCase.execute('7', {
      key: '  backend  ',
      name: '  Backend  ',
    });

    expect(result).toEqual({
      id: '7',
      key: 'backend',
      name: 'Backend',
    });
    expect(materialRepository.updateCategory).toHaveBeenCalledWith('7', {
      key: 'backend',
      name: 'Backend',
    });
  });

  it('throws when the category does not exist', async () => {
    materialRepository.updateCategory.mockResolvedValue(null);

    await expect(
      useCase.execute('7', {
        name: 'Backend',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('propagates duplicate key conflicts', async () => {
    materialRepository.updateCategory.mockRejectedValue(
      new ConflictException('Material category key is already in use'),
    );

    await expect(
      useCase.execute('7', {
        key: 'backend',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
