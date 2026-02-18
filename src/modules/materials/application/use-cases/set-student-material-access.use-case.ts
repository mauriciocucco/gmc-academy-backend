import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MATERIAL_REPOSITORY,
  MaterialRepositoryPort,
} from '../../domain/ports/material-repository.port';
import { SetStudentMaterialAccessDto } from '../dto/set-student-material-access.dto';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/ports/user-repository.port';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';

@Injectable()
export class SetStudentMaterialAccessUseCase {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: MaterialRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(input: {
    materialId: string;
    studentId: string;
    enabledById: string;
    dto: SetStudentMaterialAccessDto;
  }): Promise<void> {
    const material = await this.materialRepository.findById(input.materialId);
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    const student = await this.userRepository.findById(input.studentId);
    if (!student || student.role !== UserRole.STUDENT) {
      throw new NotFoundException('Student not found');
    }

    await this.materialRepository.setStudentAccess({
      materialId: input.materialId,
      studentId: input.studentId,
      enabled: input.dto.enabled,
      enabledById: input.enabledById,
    });
  }
}
