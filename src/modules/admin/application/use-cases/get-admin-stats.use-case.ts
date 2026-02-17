import { Inject, Injectable } from '@nestjs/common';
import {
  ADMIN_READ_REPOSITORY,
  AdminReadRepositoryPort,
  AdminStats,
} from '../../domain/ports/admin-read-repository.port';

@Injectable()
export class GetAdminStatsUseCase {
  constructor(
    @Inject(ADMIN_READ_REPOSITORY)
    private readonly adminReadRepository: AdminReadRepositoryPort,
  ) {}

  async execute(): Promise<AdminStats> {
    return this.adminReadRepository.getStats();
  }
}
