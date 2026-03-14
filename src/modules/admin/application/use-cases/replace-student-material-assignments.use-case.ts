import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MATERIAL_REPOSITORY,
  MaterialRepositoryPort,
  StudentMaterialAssignment,
} from '../../../materials/domain/ports/material-repository.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/ports/user-repository.port';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { ReplaceStudentMaterialAssignmentsDto } from '../dto/replace-student-material-assignments.dto';

@Injectable()
export class ReplaceStudentMaterialAssignmentsUseCase {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: MaterialRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(
    studentId: string,
    dto: ReplaceStudentMaterialAssignmentsDto,
  ): Promise<StudentMaterialAssignment[]> {
    const student = await this.userRepository.findById(studentId);
    if (!student || student.role !== UserRole.STUDENT) {
      throw new NotFoundException('Student not found');
    }

    const duplicatePositions = this.hasDuplicates(
      dto.assignments.map((assignment) => assignment.position),
    );
    if (duplicatePositions) {
      throw new BadRequestException(
        'Assignment positions must be unique per student',
      );
    }

    const materialIds = dto.assignments.map(
      (assignment) => assignment.materialId,
    );
    const materials = await this.materialRepository.findByIds(materialIds);
    if (materials.length !== materialIds.length) {
      throw new NotFoundException('One or more materials were not found');
    }

    return this.materialRepository.replaceStudentAssignments({
      studentId,
      assignments: dto.assignments,
    });
  }

  private hasDuplicates(values: number[]): boolean {
    return new Set(values).size !== values.length;
  }
}
