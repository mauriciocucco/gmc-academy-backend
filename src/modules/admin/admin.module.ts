import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTypeOrmEntity } from '../../database/typeorm/entities/user.typeorm-entity';
import { ExamAttemptTypeOrmEntity } from '../../database/typeorm/entities/exam-attempt.typeorm-entity';
import { StudentMaterialAssignmentTypeOrmEntity } from '../../database/typeorm/entities/student-material-assignment.typeorm-entity';
import { CertificateTypeOrmEntity } from '../../database/typeorm/entities/certificate.typeorm-entity';
import { AdminController } from './presentation/http/admin.controller';
import { ListAdminStudentsUseCase } from './application/use-cases/list-admin-students.use-case';
import { GetAdminStatsUseCase } from './application/use-cases/get-admin-stats.use-case';
import { GetAdminPerformanceUseCase } from './application/use-cases/get-admin-performance.use-case';
import { ADMIN_READ_REPOSITORY } from './domain/ports/admin-read-repository.port';
import { TypeOrmAdminReadRepository } from './infrastructure/persistence/typeorm-admin-read.repository';
import { UsersModule } from '../users/users.module';
import { MaterialsModule } from '../materials/materials.module';
import { ListStudentMaterialAssignmentsUseCase } from './application/use-cases/list-student-material-assignments.use-case';
import { ReplaceStudentMaterialAssignmentsUseCase } from './application/use-cases/replace-student-material-assignments.use-case';
import { GetAdminStudentUseCase } from './application/use-cases/get-admin-student.use-case';
import { ListAdminStudentAttemptsUseCase } from './application/use-cases/list-admin-student-attempts.use-case';
import { GetAdminStudentAttemptDetailUseCase } from './application/use-cases/get-admin-student-attempt-detail.use-case';
import { PROGRESS_REPOSITORY } from '../users/domain/ports/progress-repository.port';
import { TypeOrmProgressRepository } from '../users/infrastructure/persistence/typeorm-progress.repository';
import { ATTEMPT_READ_REPOSITORY } from '../attempts/domain/ports/attempt-read-repository.port';
import { TypeOrmAttemptReadRepository } from '../attempts/infrastructure/persistence/typeorm-attempt-read.repository';
import { UpdateAdminStudentNoteUseCase } from './application/use-cases/update-admin-student-note.use-case';
import { ListAdminStudentMaterialsProgressUseCase } from './application/use-cases/list-admin-student-materials-progress.use-case';
import { ADMIN_STUDENT_INSIGHTS_REPOSITORY } from './domain/ports/admin-student-insights-repository.port';
import { TypeOrmAdminStudentInsightsRepository } from './infrastructure/persistence/typeorm-admin-student-insights.repository';
import { AuthModule } from '../auth/auth.module';
import { CreateAdminStudentUseCase } from './application/use-cases/create-admin-student.use-case';
import { UpdateAdminStudentsAccessUseCase } from './application/use-cases/update-admin-students-access.use-case';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MaterialsModule,
    TypeOrmModule.forFeature([
      UserTypeOrmEntity,
      ExamAttemptTypeOrmEntity,
      StudentMaterialAssignmentTypeOrmEntity,
      CertificateTypeOrmEntity,
    ]),
  ],
  controllers: [AdminController],
  providers: [
    ListAdminStudentsUseCase,
    GetAdminStatsUseCase,
    GetAdminPerformanceUseCase,
    ListStudentMaterialAssignmentsUseCase,
    ReplaceStudentMaterialAssignmentsUseCase,
    GetAdminStudentUseCase,
    ListAdminStudentAttemptsUseCase,
    GetAdminStudentAttemptDetailUseCase,
    UpdateAdminStudentNoteUseCase,
    ListAdminStudentMaterialsProgressUseCase,
    CreateAdminStudentUseCase,
    UpdateAdminStudentsAccessUseCase,
    {
      provide: ADMIN_READ_REPOSITORY,
      useClass: TypeOrmAdminReadRepository,
    },
    {
      provide: ADMIN_STUDENT_INSIGHTS_REPOSITORY,
      useClass: TypeOrmAdminStudentInsightsRepository,
    },
    {
      provide: PROGRESS_REPOSITORY,
      useClass: TypeOrmProgressRepository,
    },
    {
      provide: ATTEMPT_READ_REPOSITORY,
      useClass: TypeOrmAttemptReadRepository,
    },
  ],
})
export class AdminModule {}
