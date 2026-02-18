import { Inject, Injectable } from '@nestjs/common';
import {
  MATERIAL_REPOSITORY,
  MaterialRepositoryPort,
} from '../../domain/ports/material-repository.port';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { MaterialResponseDto } from '../dto/material-response.dto';
import { validateMaterialLinks } from './material-link.validation';

@Injectable()
export class CreateMaterialUseCase {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: MaterialRepositoryPort,
  ) {}

  async execute(
    dto: CreateMaterialDto,
    createdById: string,
  ): Promise<MaterialResponseDto> {
    validateMaterialLinks(dto.links);

    const material = await this.materialRepository.create({
      title: dto.title.trim(),
      description: dto.description.trim(),
      published: dto.published ?? true,
      categoryKey: dto.categoryKey.trim().toLowerCase(),
      links: dto.links.map((link, index) => ({
        sourceType: link.sourceType,
        url: link.url.trim(),
        position: link.position ?? index,
      })),
      createdById,
    });

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
