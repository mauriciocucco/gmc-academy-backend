import { Inject, Injectable } from '@nestjs/common';
import {
  PROGRESS_REPOSITORY,
  ProgressRepositoryPort,
  StudentProgress,
} from '../../domain/ports/progress-repository.port';

@Injectable()
export class GetMyProgressUseCase {
  constructor(
    @Inject(PROGRESS_REPOSITORY)
    private readonly progressRepository: ProgressRepositoryPort,
  ) {}

  async execute(studentId: string): Promise<StudentProgress> {
    return this.progressRepository.getStudentProgress(studentId);
  }
}
