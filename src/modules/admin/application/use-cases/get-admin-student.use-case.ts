import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/ports/user-repository.port';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import {
  PROGRESS_REPOSITORY,
  ProgressRepositoryPort,
} from '../../../users/domain/ports/progress-repository.port';
import {
  ATTEMPT_READ_REPOSITORY,
  AttemptReadRepositoryPort,
} from '../../../attempts/domain/ports/attempt-read-repository.port';
import { AdminStudentDetailResponseDto } from '../dto/admin-student-response.dto';
import {
  ADMIN_STUDENT_INSIGHTS_REPOSITORY,
  AdminStudentInsightsRepositoryPort,
} from '../../domain/ports/admin-student-insights-repository.port';

@Injectable()
export class GetAdminStudentUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(PROGRESS_REPOSITORY)
    private readonly progressRepository: ProgressRepositoryPort,
    @Inject(ATTEMPT_READ_REPOSITORY)
    private readonly attemptReadRepository: AttemptReadRepositoryPort,
    @Inject(ADMIN_STUDENT_INSIGHTS_REPOSITORY)
    private readonly adminStudentInsightsRepository: AdminStudentInsightsRepositoryPort,
  ) {}

  async execute(studentId: string): Promise<AdminStudentDetailResponseDto> {
    const student = await this.userRepository.findById(studentId);
    if (!student || student.role !== UserRole.STUDENT) {
      throw new NotFoundException('Student not found');
    }

    const [progress, attempts, note] = await Promise.all([
      this.progressRepository.getStudentProgress(studentId),
      this.attemptReadRepository.findByStudentId(studentId),
      this.adminStudentInsightsRepository.findStudentNote(studentId),
    ]);

    const lastAttempt = attempts[0] ?? null;
    const passedAttempts = attempts.filter((attempt) => attempt.passed);
    const totalAttempts = attempts.length;
    const scoreSum = attempts.reduce((sum, attempt) => sum + attempt.score, 0);

    return {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      profilePhotoUrl: student.profilePhotoUrl,
      approved: lastAttempt?.passed ?? false,
      blocked: student.blockedAt != null,
      blockedAt: student.blockedAt?.toISOString() ?? null,
      blockReason: student.blockReason ?? null,
      lastAttemptScore: lastAttempt?.score ?? null,
      note: note
        ? {
            content: note.content,
            updatedAt: note.updatedAt.toISOString(),
            updatedByName: note.updatedByName,
          }
        : null,
      progress,
      stats: {
        totalAttempts,
        passedAttempts: passedAttempts.length,
        failedAttempts: totalAttempts - passedAttempts.length,
        bestScore:
          totalAttempts > 0
            ? Math.max(...attempts.map((attempt) => attempt.score))
            : null,
        averageScore: totalAttempts > 0 ? scoreSum / totalAttempts : null,
        lastAttemptAt: lastAttempt?.createdAt.toISOString() ?? null,
        lastPassedAt: passedAttempts[0]?.createdAt.toISOString() ?? null,
      },
    };
  }
}
