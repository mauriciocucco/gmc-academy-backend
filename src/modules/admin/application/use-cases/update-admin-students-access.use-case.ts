import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/ports/user-repository.port';
import {
  UpdateAdminStudentsAccessDto,
  UpdateAdminStudentsAccessResponseDto,
} from '../dto/update-admin-students-access.dto';

@Injectable()
export class UpdateAdminStudentsAccessUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(
    adminUserId: string,
    dto: UpdateAdminStudentsAccessDto,
  ): Promise<UpdateAdminStudentsAccessResponseDto> {
    const studentIds = [...new Set(dto.studentIds)];
    const students = await this.userRepository.findByIds(studentIds);

    if (
      students.length !== studentIds.length ||
      students.some((student) => student.role !== UserRole.STUDENT)
    ) {
      throw new NotFoundException('One or more students were not found');
    }

    await this.userRepository.updateAccessStatus({
      userIds: studentIds,
      blocked: dto.blocked,
      blockedByUserId: dto.blocked ? adminUserId : null,
      reason: dto.blocked ? dto.reason ?? null : null,
    });

    const updatedStudents = await this.userRepository.findByIds(studentIds);
    const updatedById = new Map(
      updatedStudents.map((student) => [student.id, student] as const),
    );

    return {
      items: studentIds.map((studentId) => {
        const student = updatedById.get(studentId);

        return {
          id: studentId,
          blocked: student?.blockedAt != null,
          blockedAt: student?.blockedAt?.toISOString() ?? null,
          blockReason: student?.blockReason ?? null,
        };
      }),
    };
  }
}
