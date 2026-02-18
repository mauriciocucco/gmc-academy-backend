import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTypeOrmEntity } from '../../database/typeorm/entities/user.typeorm-entity';
import { ExamAttemptTypeOrmEntity } from '../../database/typeorm/entities/exam-attempt.typeorm-entity';
import { AdminController } from './presentation/http/admin.controller';
import { ListAdminStudentsUseCase } from './application/use-cases/list-admin-students.use-case';
import { GetAdminStatsUseCase } from './application/use-cases/get-admin-stats.use-case';
import { GetAdminPerformanceUseCase } from './application/use-cases/get-admin-performance.use-case';
import { ADMIN_READ_REPOSITORY } from './domain/ports/admin-read-repository.port';
import { TypeOrmAdminReadRepository } from './infrastructure/persistence/typeorm-admin-read.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserTypeOrmEntity, ExamAttemptTypeOrmEntity]),
  ],
  controllers: [AdminController],
  providers: [
    ListAdminStudentsUseCase,
    GetAdminStatsUseCase,
    GetAdminPerformanceUseCase,
    {
      provide: ADMIN_READ_REPOSITORY,
      useClass: TypeOrmAdminReadRepository,
    },
  ],
})
export class AdminModule {}
