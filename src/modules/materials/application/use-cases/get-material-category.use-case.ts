import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MATERIAL_REPOSITORY,
  MaterialRepositoryPort,
} from '../../domain/ports/material-repository.port';
import { MaterialCategoryResponseDto } from '../dto/material-response.dto';

@Injectable()
export class GetMaterialCategoryUseCase {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: MaterialRepositoryPort,
  ) {}

  async execute(id: string): Promise<MaterialCategoryResponseDto> {
    const category = await this.materialRepository.findCategoryById(id);
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
