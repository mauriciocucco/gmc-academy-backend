import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/ports/user-repository.port';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import {
  ADMIN_STUDENT_INSIGHTS_REPOSITORY,
  AdminStudentInsightsRepositoryPort,
  AdminStudentMaterialProgressItem,
} from '../../domain/ports/admin-student-insights-repository.port';

@Injectable()
export class ListAdminStudentMaterialsProgressUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(ADMIN_STUDENT_INSIGHTS_REPOSITORY)
    private readonly adminStudentInsightsRepository: AdminStudentInsightsRepositoryPort,
  ) {}

  async execute(
    studentId: string,
  ): Promise<AdminStudentMaterialProgressItem[]> {
    const student = await this.userRepository.findById(studentId);
    if (!student || student.role !== UserRole.STUDENT) {
      throw new NotFoundException('Student not found');
    }

    return this.adminStudentInsightsRepository.listStudentMaterialsProgress(
      studentId,
    );
  }
}
