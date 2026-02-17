import { Inject, Injectable } from '@nestjs/common';
import {
  MATERIAL_REPOSITORY,
  MaterialRepositoryPort,
} from '../../domain/ports/material-repository.port';
import { MaterialResponseDto } from '../dto/material-response.dto';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';

@Injectable()
export class ListMaterialsUseCase {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: MaterialRepositoryPort,
  ) {}

  async execute(role: UserRole): Promise<MaterialResponseDto[]> {
    const materials =
      role === UserRole.ADMIN
        ? await this.materialRepository.findAll()
        : await this.materialRepository.findPublished();

    return materials.map((material) => ({
      id: material.id,
      title: material.title,
      description: material.description,
      driveUrl: material.driveUrl,
      category: material.category,
      published: material.published,
      publishedAt: material.createdAt.toISOString().slice(0, 10),
      createdById: material.createdById,
    }));
  }
}
