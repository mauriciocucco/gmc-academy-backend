import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamAttemptTypeOrmEntity } from '../../database/typeorm/entities/exam-attempt.typeorm-entity';
import { AttemptsController } from './presentation/http/attempts.controller';
import { ListMyAttemptsUseCase } from './application/use-cases/list-my-attempts.use-case';
import { ATTEMPT_READ_REPOSITORY } from './domain/ports/attempt-read-repository.port';
import { TypeOrmAttemptReadRepository } from './infrastructure/persistence/typeorm-attempt-read.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ExamAttemptTypeOrmEntity])],
  controllers: [AttemptsController],
  providers: [
    ListMyAttemptsUseCase,
    {
      provide: ATTEMPT_READ_REPOSITORY,
      useClass: TypeOrmAttemptReadRepository,
    },
  ],
})
export class AttemptsModule {}
