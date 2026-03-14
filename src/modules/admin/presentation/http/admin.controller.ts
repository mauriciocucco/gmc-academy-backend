import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../../common/infrastructure/http/decorators/roles.decorator';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { CurrentUser } from '../../../../common/infrastructure/http/decorators/current-user.decorator';
import { JwtPayload } from '../../../../common/infrastructure/http/interfaces/jwt-payload.interface';
import { ListAdminStudentsUseCase } from '../../application/use-cases/list-admin-students.use-case';
import { GetAdminStatsUseCase } from '../../application/use-cases/get-admin-stats.use-case';
import {
  AdminPerformance,
  AdminStats,
  AdminStudentListResult,
} from '../../domain/ports/admin-read-repository.port';
import { GetAdminPerformanceUseCase } from '../../application/use-cases/get-admin-performance.use-case';
import { AdminStatsResponseDto } from '../../application/dto/admin-stats-response.dto';
import { AdminPerformanceResponseDto } from '../../application/dto/admin-performance-response.dto';
import { StudentMaterialAssignmentResponseDto } from '../../application/dto/student-material-assignment-response.dto';
import { ListStudentMaterialAssignmentsUseCase } from '../../application/use-cases/list-student-material-assignments.use-case';
import { ReplaceStudentMaterialAssignmentsUseCase } from '../../application/use-cases/replace-student-material-assignments.use-case';
import { ReplaceStudentMaterialAssignmentsDto } from '../../application/dto/replace-student-material-assignments.dto';
import {
  AdminStudentDetailResponseDto,
  AdminStudentNoteResponseDto,
} from '../../application/dto/admin-student-response.dto';
import { GetAdminStudentUseCase } from '../../application/use-cases/get-admin-student.use-case';
import {
  AttemptDetailResponseDto,
  AttemptResponseDto,
} from '../../../attempts/application/dto/attempt-response.dto';
import { ListAdminStudentAttemptsUseCase } from '../../application/use-cases/list-admin-student-attempts.use-case';
import { GetAdminStudentAttemptDetailUseCase } from '../../application/use-cases/get-admin-student-attempt-detail.use-case';
import {
  ListAdminStudentsQueryDto,
  ListAdminStudentsResponseDto,
} from '../../application/dto/list-admin-students.dto';
import { UpdateAdminStudentNoteDto } from '../../application/dto/update-admin-student-note.dto';
import { UpdateAdminStudentNoteUseCase } from '../../application/use-cases/update-admin-student-note.use-case';
import { ListAdminStudentMaterialsProgressUseCase } from '../../application/use-cases/list-admin-student-materials-progress.use-case';
import { AdminStudentMaterialProgressResponseDto } from '../../application/dto/admin-student-material-progress-response.dto';
import {
  CreateAdminStudentDto,
  CreateAdminStudentResponseDto,
} from '../../application/dto/create-admin-student.dto';
import { CreateAdminStudentUseCase } from '../../application/use-cases/create-admin-student.use-case';

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
    private readonly listStudentMaterialAssignmentsUseCase: ListStudentMaterialAssignmentsUseCase,
    private readonly replaceStudentMaterialAssignmentsUseCase: ReplaceStudentMaterialAssignmentsUseCase,
    private readonly getAdminStudentUseCase: GetAdminStudentUseCase,
    private readonly listAdminStudentAttemptsUseCase: ListAdminStudentAttemptsUseCase,
    private readonly getAdminStudentAttemptDetailUseCase: GetAdminStudentAttemptDetailUseCase,
    private readonly updateAdminStudentNoteUseCase: UpdateAdminStudentNoteUseCase,
    private readonly listAdminStudentMaterialsProgressUseCase: ListAdminStudentMaterialsProgressUseCase,
    private readonly createAdminStudentUseCase: CreateAdminStudentUseCase,
  ) {}

  @ApiOperation({ summary: 'Create a new student user (Admin only)' })
  @ApiResponse({
    status: 201,
    description:
      'Created student with a generated temporary password shown only once',
    type: CreateAdminStudentResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email is already in use' })
  @Post('students')
  async createStudent(
    @Body() body: CreateAdminStudentDto,
  ): Promise<CreateAdminStudentResponseDto> {
    return this.createAdminStudentUseCase.execute(body);
  }

  @ApiOperation({
    summary: 'List all students with their latest attempt (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of students',
    type: ListAdminStudentsResponseDto,
  })
  @Get('students')
  async students(
    @Query() query: ListAdminStudentsQueryDto,
  ): Promise<AdminStudentListResult> {
    return this.listAdminStudentsUseCase.execute({
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      search: query.search,
      status: query.status ?? 'all',
      attemptState: query.attemptState ?? 'all',
    });
  }

  @ApiOperation({
    summary: 'Get student detail with progress and stats (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Student user ID' })
  @ApiResponse({
    status: 200,
    description: 'Student detail with progress and attempt stats',
    type: AdminStudentDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @Get('students/:id')
  async student(
    @Param('id') studentId: string,
  ): Promise<AdminStudentDetailResponseDto> {
    return this.getAdminStudentUseCase.execute(studentId);
  }

  @ApiOperation({
    summary: 'Create or update the internal note for a student (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Student user ID' })
  @ApiResponse({
    status: 200,
    description: 'Updated internal note for the student',
    type: AdminStudentNoteResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @Patch('students/:id/note')
  async updateStudentNote(
    @Param('id') studentId: string,
    @CurrentUser() currentUser: JwtPayload,
    @Body() body: UpdateAdminStudentNoteDto,
  ): Promise<AdminStudentNoteResponseDto> {
    const note = await this.updateAdminStudentNoteUseCase.execute(
      studentId,
      currentUser.sub,
      body,
    );

    return {
      content: note.content,
      updatedAt: note.updatedAt.toISOString(),
      updatedByName: note.updatedByName,
    };
  }

  @ApiOperation({ summary: 'List exam attempts for a student (Admin only)' })
  @ApiParam({ name: 'id', description: 'Student user ID' })
  @ApiResponse({
    status: 200,
    description: 'Student attempts ordered from latest to oldest',
    type: [AttemptResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @Get('students/:id/attempts')
  async studentAttempts(
    @Param('id') studentId: string,
  ): Promise<AttemptResponseDto[]> {
    return this.listAdminStudentAttemptsUseCase.execute(studentId);
  }

  @ApiOperation({
    summary:
      'List assigned materials with viewed state for a student (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Student user ID' })
  @ApiResponse({
    status: 200,
    description: 'Assigned materials ordered by position with viewed progress',
    type: [AdminStudentMaterialProgressResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @Get('students/:id/materials-progress')
  async studentMaterialsProgress(
    @Param('id') studentId: string,
  ): Promise<AdminStudentMaterialProgressResponseDto[]> {
    const materials =
      await this.listAdminStudentMaterialsProgressUseCase.execute(studentId);

    return materials.map((material) => ({
      materialId: material.materialId,
      title: material.title,
      description: material.description,
      category: material.category,
      position: material.position,
      viewed: material.viewed,
      viewedAt: material.viewedAt?.toISOString() ?? null,
      linksCount: material.linksCount,
    }));
  }

  @ApiOperation({
    summary: 'Get detailed review for a student attempt (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Student user ID' })
  @ApiParam({ name: 'attemptId', description: 'Attempt ID' })
  @ApiResponse({
    status: 200,
    description: 'Student attempt detail snapshot',
    type: AttemptDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Student or attempt not found' })
  @Get('students/:id/attempts/:attemptId')
  async studentAttemptDetail(
    @Param('id') studentId: string,
    @Param('attemptId') attemptId: string,
  ): Promise<AttemptDetailResponseDto> {
    return this.getAdminStudentAttemptDetailUseCase.execute(
      studentId,
      attemptId,
    );
  }

  @ApiOperation({ summary: 'Get platform stats (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Platform statistics',
    type: AdminStatsResponseDto,
  })
  @Get('stats')
  async stats(): Promise<AdminStats> {
    return this.getAdminStatsUseCase.execute();
  }

  @ApiOperation({ summary: 'Get performance data (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Performance data by exam and student',
    type: AdminPerformanceResponseDto,
  })
  @Get('performance')
  async performance(): Promise<AdminPerformance> {
    return this.getAdminPerformanceUseCase.execute();
  }

  @ApiOperation({
    summary: 'List material assignments for a student (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Student user ID' })
  @ApiResponse({
    status: 200,
    description: 'Student material assignments ordered by position',
    type: [StudentMaterialAssignmentResponseDto],
  })
  @Get('students/:id/material-assignments')
  async listStudentMaterialAssignments(
    @Param('id') studentId: string,
  ): Promise<StudentMaterialAssignmentResponseDto[]> {
    return this.listStudentMaterialAssignmentsUseCase.execute(studentId);
  }

  @ApiOperation({
    summary: 'Replace all material assignments for a student (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Student user ID' })
  @ApiResponse({
    status: 200,
    description: 'Saved material assignments ordered by position',
    type: [StudentMaterialAssignmentResponseDto],
  })
  @Patch('students/:id/material-assignments')
  async replaceStudentMaterialAssignments(
    @Param('id') studentId: string,
    @Body() body: ReplaceStudentMaterialAssignmentsDto,
  ): Promise<StudentMaterialAssignmentResponseDto[]> {
    return this.replaceStudentMaterialAssignmentsUseCase.execute(
      studentId,
      body,
    );
  }
}
