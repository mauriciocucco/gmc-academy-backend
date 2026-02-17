import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../../common/infrastructure/http/decorators/roles.decorator';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { ListAdminStudentsUseCase } from '../../application/use-cases/list-admin-students.use-case';
import { GetAdminStatsUseCase } from '../../application/use-cases/get-admin-stats.use-case';
import {
  AdminStats,
  AdminStudentItem,
} from '../../domain/ports/admin-read-repository.port';

@Controller({ path: 'admin', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly listAdminStudentsUseCase: ListAdminStudentsUseCase,
    private readonly getAdminStatsUseCase: GetAdminStatsUseCase,
  ) {}

  @Get('students')
  async students(): Promise<AdminStudentItem[]> {
    return this.listAdminStudentsUseCase.execute();
  }

  @Get('stats')
  async stats(): Promise<AdminStats> {
    return this.getAdminStatsUseCase.execute();
  }
}
