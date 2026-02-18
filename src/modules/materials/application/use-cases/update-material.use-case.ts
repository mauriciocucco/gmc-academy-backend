import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MATERIAL_REPOSITORY,
  MaterialRepositoryPort,
} from '../../domain/ports/material-repository.port';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { MaterialResponseDto } from '../dto/material-response.dto';
import { validateMaterialLinks } from './material-link.validation';

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
    if (dto.links) {
      validateMaterialLinks(dto.links);
    }

    const material = await this.materialRepository.update(id, {
      title: dto.title?.trim(),
      description: dto.description?.trim(),
      categoryKey: dto.categoryKey?.trim().toLowerCase(),
      links: dto.links?.map((link, index) => ({
        sourceType: link.sourceType,
        url: link.url.trim(),
        position: link.position ?? index,
      })),
      published: dto.published,
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return {
      id: material.id,
      title: material.title,
      description: material.description,
      published: material.published,
      publishedAt: material.createdAt.toISOString().slice(0, 10),
      viewed: null,
      createdById: material.createdById,
      category: {
        id: material.category.id,
        key: material.category.key,
        name: material.category.name,
      },
      links: material.links
        .sort((a, b) => a.position - b.position)
        .map((link) => ({
          id: link.id,
          sourceType: link.sourceType,
          url: link.url,
          position: link.position,
        })),
    };
  }
}
