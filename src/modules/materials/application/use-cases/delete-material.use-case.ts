import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MATERIAL_REPOSITORY,
  MaterialRepositoryPort,
} from '../../domain/ports/material-repository.port';

@Injectable()
export class DeleteMaterialUseCase {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: MaterialRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const material = await this.materialRepository.findById(id);
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    await this.materialRepository.delete(id);
  }
}
