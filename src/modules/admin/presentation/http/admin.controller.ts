import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../../common/infrastructure/http/decorators/roles.decorator';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { ListAdminStudentsUseCase } from '../../application/use-cases/list-admin-students.use-case';
import { GetAdminStatsUseCase } from '../../application/use-cases/get-admin-stats.use-case';
import {
  AdminPerformance,
  AdminStats,
  AdminStudentItem,
} from '../../domain/ports/admin-read-repository.port';
import { GetAdminPerformanceUseCase } from '../../application/use-cases/get-admin-performance.use-case';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly listAdminStudentsUseCase: ListAdminStudentsUseCase,
    private readonly getAdminStatsUseCase: GetAdminStatsUseCase,
    private readonly getAdminPerformanceUseCase: GetAdminPerformanceUseCase,
  ) {}

  @ApiOperation({
    summary: 'List all students with their latest attempt (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of students',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          fullName: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string', nullable: true },
          lastAttemptScore: { type: 'number', nullable: true },
          approved: { type: 'boolean' },
        },
      },
    },
  })
  @Get('students')
  async students(): Promise<AdminStudentItem[]> {
    return this.listAdminStudentsUseCase.execute();
  }

  @ApiOperation({ summary: 'Get platform stats (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Platform statistics',
    schema: {
      type: 'object',
      properties: {
        totalStudents: { type: 'number' },
        totalAttempts: { type: 'number' },
        approvedAttempts: { type: 'number' },
        approvedStudents: { type: 'number' },
      },
    },
  })
  @Get('stats')
  async stats(): Promise<AdminStats> {
    return this.getAdminStatsUseCase.execute();
  }

  @ApiOperation({ summary: 'Get performance data (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Performance data by exam and student',
    schema: {
      type: 'object',
      properties: {
        overall: {
          type: 'object',
          properties: {
            averageScore: { type: 'number' },
            passRate: { type: 'number' },
            totalAttempts: { type: 'number' },
          },
        },
        byExam: { type: 'array', items: { type: 'object' } },
        byStudent: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @Get('performance')
  async performance(): Promise<AdminPerformance> {
    return this.getAdminPerformanceUseCase.execute();
  }
}
