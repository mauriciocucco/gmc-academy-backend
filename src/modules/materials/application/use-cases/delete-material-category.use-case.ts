import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MATERIAL_REPOSITORY,
  MaterialRepositoryPort,
} from '../../domain/ports/material-repository.port';

@Injectable()
export class DeleteMaterialCategoryUseCase {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: MaterialRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const category = await this.materialRepository.findCategoryById(id);
    if (!category) {
      throw new NotFoundException('Material category not found');
    }

    const hasMaterials = await this.materialRepository.categoryHasMaterials(id);
    if (hasMaterials) {
      throw new BadRequestException(
        'Material category cannot be deleted while it has materials assigned',
      );
    }

    await this.materialRepository.deleteCategory(id);
  }
}
