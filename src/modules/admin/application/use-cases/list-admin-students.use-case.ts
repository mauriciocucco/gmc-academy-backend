import { Inject, Injectable } from '@nestjs/common';
import {
  ADMIN_READ_REPOSITORY,
  AdminReadRepositoryPort,
  AdminStudentListResult,
  ListAdminStudentsFilters,
} from '../../domain/ports/admin-read-repository.port';

@Injectable()
export class ListAdminStudentsUseCase {
  constructor(
    @Inject(ADMIN_READ_REPOSITORY)
    private readonly adminReadRepository: AdminReadRepositoryPort,
  ) {}

  async execute(
    filters: ListAdminStudentsFilters,
  ): Promise<AdminStudentListResult> {
    return this.adminReadRepository.listStudentsWithLatestAttempt(filters);
  }
}
