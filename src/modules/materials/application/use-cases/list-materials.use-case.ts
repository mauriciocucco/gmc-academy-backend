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

  async execute(input: {
    role: UserRole;
    userId: string;
  }): Promise<MaterialResponseDto[]> {
    const materials =
      input.role === UserRole.ADMIN
        ? await this.materialRepository.findAll()
        : await this.materialRepository.findEnabledForStudent(input.userId);

    return materials.map((material) => ({
      id: material.id,
      title: material.title,
      description: material.description,
      published: material.published,
      publishedAt: material.createdAt.toISOString().slice(0, 10),
      viewed: material.viewed,
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
    }));
  }
}
