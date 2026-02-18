import { Inject, Injectable } from '@nestjs/common';
import {
  MATERIAL_REPOSITORY,
  MaterialRepositoryPort,
} from '../../domain/ports/material-repository.port';
import { CreateMaterialCategoryDto } from '../dto/create-material-category.dto';
import { MaterialCategoryResponseDto } from '../dto/material-response.dto';

@Injectable()
export class CreateMaterialCategoryUseCase {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: MaterialRepositoryPort,
  ) {}

  async execute(
    dto: CreateMaterialCategoryDto,
  ): Promise<MaterialCategoryResponseDto> {
    const category = await this.materialRepository.createCategory({
      key: dto.key.trim().toLowerCase(),
      name: dto.name.trim(),
    });

    return {
      id: category.id,
      key: category.key,
      name: category.name,
    };
  }
}
