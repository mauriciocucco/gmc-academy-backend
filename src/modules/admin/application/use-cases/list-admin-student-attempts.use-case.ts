import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/ports/user-repository.port';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import {
  ATTEMPT_READ_REPOSITORY,
  AttemptReadRepositoryPort,
} from '../../../attempts/domain/ports/attempt-read-repository.port';
import { AttemptResponseDto } from '../../../attempts/application/dto/attempt-response.dto';

@Injectable()
export class ListAdminStudentAttemptsUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(ATTEMPT_READ_REPOSITORY)
    private readonly attemptReadRepository: AttemptReadRepositoryPort,
  ) {}

  async execute(studentId: string): Promise<AttemptResponseDto[]> {
    const student = await this.userRepository.findById(studentId);
    if (!student || student.role !== UserRole.STUDENT) {
      throw new NotFoundException('Student not found');
    }

    const attempts = await this.attemptReadRepository.findByStudentId(studentId);

    return attempts.map((attempt) => ({
      id: attempt.id,
      examId: attempt.examId,
      examTitle: attempt.examTitle,
      score: attempt.score,
      passed: attempt.passed,
      createdAt: attempt.createdAt.toISOString(),
    }));
  }
}
