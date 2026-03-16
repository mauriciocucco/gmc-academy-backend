import { Inject, Injectable } from '@nestjs/common';
import {
  MATERIAL_REPOSITORY,
  MaterialRepositoryPort,
} from '../../domain/ports/material-repository.port';
import { MaterialResponseDto } from '../dto/material-response.dto';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { toMaterialResponseDto } from './material-response.mapper';

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
        : await this.materialRepository.findAssignedToStudent(input.userId);

    return materials.map(toMaterialResponseDto);
  }
}
