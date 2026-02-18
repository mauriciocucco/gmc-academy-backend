import { Inject, Injectable } from '@nestjs/common';
import {
  ADMIN_READ_REPOSITORY,
  AdminPerformance,
  AdminReadRepositoryPort,
} from '../../domain/ports/admin-read-repository.port';

@Injectable()
export class GetAdminPerformanceUseCase {
  constructor(
    @Inject(ADMIN_READ_REPOSITORY)
    private readonly adminReadRepository: AdminReadRepositoryPort,
  ) {}

  async execute(): Promise<AdminPerformance> {
    return this.adminReadRepository.getPerformance();
  }
}
