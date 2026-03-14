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
export class SetMaterialViewedUseCase {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: MaterialRepositoryPort,
  ) {}

  async execute(
    materialId: string,
    studentId: string,
    viewed: boolean,
  ): Promise<void> {
    const material = await this.materialRepository.findById(materialId);
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    const hasAccess = await this.materialRepository.hasStudentAccessToMaterial(
      materialId,
      studentId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('Access to this material is not enabled');
    }

    if (viewed) {
      await this.materialRepository.markAsViewed(materialId, studentId);
    } else {
      await this.materialRepository.unmarkAsViewed(materialId, studentId);
    }
  }
}
