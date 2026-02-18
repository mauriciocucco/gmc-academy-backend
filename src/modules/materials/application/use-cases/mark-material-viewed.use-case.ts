import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MATERIAL_REPOSITORY,
  MaterialRepositoryPort,
} from '../../domain/ports/material-repository.port';

@Injectable()
export class MarkMaterialViewedUseCase {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: MaterialRepositoryPort,
  ) {}

  async execute(materialId: string, studentId: string): Promise<void> {
    const material = await this.materialRepository.findById(materialId);
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    const enabled =
      await this.materialRepository.findEnabledForStudent(studentId);
    const hasAccess = enabled.some((m) => m.id === materialId);
    if (!hasAccess) {
      throw new ForbiddenException('Access to this material is not enabled');
    }

    await this.materialRepository.markAsViewed(materialId, studentId);
  }
}
