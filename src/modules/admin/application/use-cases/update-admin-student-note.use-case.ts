import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/ports/user-repository.port';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import {
  ADMIN_STUDENT_INSIGHTS_REPOSITORY,
  AdminStudentInsightsRepositoryPort,
  AdminStudentNote,
} from '../../domain/ports/admin-student-insights-repository.port';
import { UpdateAdminStudentNoteDto } from '../dto/update-admin-student-note.dto';

@Injectable()
export class UpdateAdminStudentNoteUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(ADMIN_STUDENT_INSIGHTS_REPOSITORY)
    private readonly adminStudentInsightsRepository: AdminStudentInsightsRepositoryPort,
  ) {}

  async execute(
    studentId: string,
    adminUserId: string,
    dto: UpdateAdminStudentNoteDto,
  ): Promise<AdminStudentNote> {
    const [student, adminUser] = await Promise.all([
      this.userRepository.findById(studentId),
      this.userRepository.findById(adminUserId),
    ]);

    if (!student || student.role !== UserRole.STUDENT) {
      throw new NotFoundException('Student not found');
    }

    if (!adminUser || adminUser.role !== UserRole.ADMIN) {
      throw new NotFoundException('Admin user not found');
    }

    return this.adminStudentInsightsRepository.saveStudentNote({
      studentId,
      content: dto.content,
      updatedById: adminUserId,
    });
  }
}
