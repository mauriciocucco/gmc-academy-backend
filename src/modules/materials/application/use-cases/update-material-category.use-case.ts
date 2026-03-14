import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MATERIAL_REPOSITORY,
  MaterialRepositoryPort,
} from '../../domain/ports/material-repository.port';
import { MaterialCategoryResponseDto } from '../dto/material-response.dto';
import { UpdateMaterialCategoryDto } from '../dto/update-material-category.dto';

@Injectable()
export class UpdateMaterialCategoryUseCase {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: MaterialRepositoryPort,
  ) {}

  async execute(
    id: string,
    dto: UpdateMaterialCategoryDto,
  ): Promise<MaterialCategoryResponseDto> {
    const category = await this.materialRepository.updateCategory(id, {
      key: dto.key?.trim().toLowerCase(),
      name: dto.name?.trim(),
    });
    if (!category) {
      throw new NotFoundException('Material category not found');
    }

    return {
      id: category.id,
      key: category.key,
      name: category.name,
    };
  }
}
