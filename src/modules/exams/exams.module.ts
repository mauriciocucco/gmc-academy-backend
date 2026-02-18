import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamTypeOrmEntity } from '../../database/typeorm/entities/exam.typeorm-entity';
import { ExamAttemptTypeOrmEntity } from '../../database/typeorm/entities/exam-attempt.typeorm-entity';
import { CertificateTypeOrmEntity } from '../../database/typeorm/entities/certificate.typeorm-entity';
import { ExamsController } from './presentation/http/exams.controller';
import { GetActiveExamUseCase } from './application/use-cases/get-active-exam.use-case';
import { SubmitExamUseCase } from './application/use-cases/submit-exam.use-case';
import { EXAM_READ_REPOSITORY } from './domain/ports/exam-read-repository.port';
import { TypeOrmExamReadRepository } from './infrastructure/persistence/typeorm-exam-read.repository';
import { EXAM_ATTEMPT_REPOSITORY } from './domain/ports/exam-attempt-repository.port';
import { TypeOrmExamAttemptRepository } from './infrastructure/persistence/typeorm-exam-attempt.repository';
import { EXAM_MANAGEMENT_REPOSITORY } from './domain/ports/exam-management-repository.port';
import { TypeOrmExamManagementRepository } from './infrastructure/persistence/typeorm-exam-management.repository';
import { ListExamsUseCase } from './application/use-cases/list-exams.use-case';
import { GetExamDetailUseCase } from './application/use-cases/get-exam-detail.use-case';
import { CreateExamUseCase } from './application/use-cases/create-exam.use-case';
import { UpdateExamUseCase } from './application/use-cases/update-exam.use-case';
import { DeleteExamUseCase } from './application/use-cases/delete-exam.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExamTypeOrmEntity,
      ExamAttemptTypeOrmEntity,
      CertificateTypeOrmEntity,
    ]),
  ],
  controllers: [ExamsController],
  providers: [
    GetActiveExamUseCase,
    ListExamsUseCase,
    GetExamDetailUseCase,
    CreateExamUseCase,
    UpdateExamUseCase,
    DeleteExamUseCase,
    SubmitExamUseCase,
    {
      provide: EXAM_READ_REPOSITORY,
      useClass: TypeOrmExamReadRepository,
    },
    {
      provide: EXAM_MANAGEMENT_REPOSITORY,
      useClass: TypeOrmExamManagementRepository,
    },
    {
      provide: EXAM_ATTEMPT_REPOSITORY,
      useClass: TypeOrmExamAttemptRepository,
    },
  ],
})
export class ExamsModule {}
