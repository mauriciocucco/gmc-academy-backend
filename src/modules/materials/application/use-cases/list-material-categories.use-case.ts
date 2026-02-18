import { Inject, Injectable } from '@nestjs/common';
import {
  MATERIAL_REPOSITORY,
  MaterialRepositoryPort,
} from '../../domain/ports/material-repository.port';
import { MaterialCategoryResponseDto } from '../dto/material-response.dto';

@Injectable()
export class ListMaterialCategoriesUseCase {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: MaterialRepositoryPort,
  ) {}

  async execute(): Promise<MaterialCategoryResponseDto[]> {
    const categories = await this.materialRepository.listCategories();
    return categories.map((category) => ({
      id: category.id,
      key: category.key,
      name: category.name,
    }));
  }
}
