import { Inject, Injectable } from '@nestjs/common';
import {
  MATERIAL_REPOSITORY,
  ListAdminMaterialsFilters,
  MaterialRepositoryPort,
} from '../../domain/ports/material-repository.port';
import { ListAdminMaterialsResponseDto } from '../dto/list-admin-materials.dto';
import { toMaterialResponseDto } from './material-response.mapper';

@Injectable()
export class ListAdminMaterialsUseCase {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: MaterialRepositoryPort,
  ) {}

  async execute(
    filters: ListAdminMaterialsFilters,
  ): Promise<ListAdminMaterialsResponseDto> {
    const result = await this.materialRepository.listForAdmin(filters);

    return {
      items: result.items.map(toMaterialResponseDto),
      meta: result.meta,
    };
  }
}
