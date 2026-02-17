import { Inject, Injectable } from '@nestjs/common';
import {
  MATERIAL_REPOSITORY,
  MaterialRepositoryPort,
} from '../../domain/ports/material-repository.port';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { MaterialResponseDto } from '../dto/material-response.dto';

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
    const material = await this.materialRepository.create({
      title: dto.title.trim(),
      description: dto.description.trim(),
      driveUrl: dto.driveUrl.trim(),
      category: dto.category,
      published: dto.published ?? true,
      createdById,
    });

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
