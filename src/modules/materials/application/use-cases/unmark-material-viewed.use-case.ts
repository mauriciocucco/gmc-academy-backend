import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MATERIAL_REPOSITORY,
  MaterialRepositoryPort,
} from '../../domain/ports/material-repository.port';

@Injectable()
export class UnmarkMaterialViewedUseCase {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: MaterialRepositoryPort,
  ) {}

  async execute(materialId: string, studentId: string): Promise<void> {
    const material = await this.materialRepository.findById(materialId);
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    await this.materialRepository.unmarkAsViewed(materialId, studentId);
  }
}
