import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MATERIAL_REPOSITORY,
  MaterialRepositoryPort,
} from '../../domain/ports/material-repository.port';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { MaterialResponseDto } from '../dto/material-response.dto';

@Injectable()
export class UpdateMaterialUseCase {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: MaterialRepositoryPort,
  ) {}

  async execute(
    id: string,
    dto: UpdateMaterialDto,
  ): Promise<MaterialResponseDto> {
    const material = await this.materialRepository.update(id, {
      title: dto.title?.trim(),
      description: dto.description?.trim(),
      driveUrl: dto.driveUrl?.trim(),
      category: dto.category,
      published: dto.published,
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return {
      id: material.id,
      title: material.title,
      description: material.description,
      driveUrl: material.driveUrl,
      category: material.category,
      published: material.published,
      publishedAt: material.createdAt.toISOString().slice(0, 10),
      createdById: material.createdById,
    };
  }
}
