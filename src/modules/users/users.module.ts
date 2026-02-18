import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTypeOrmEntity } from '../../database/typeorm/entities/user.typeorm-entity';
import { StudentMaterialAccessTypeOrmEntity } from '../../database/typeorm/entities/student-material-access.typeorm-entity';
import { ExamAttemptTypeOrmEntity } from '../../database/typeorm/entities/exam-attempt.typeorm-entity';
import { CertificateTypeOrmEntity } from '../../database/typeorm/entities/certificate.typeorm-entity';
import { USER_REPOSITORY } from './domain/ports/user-repository.port';
import { PROGRESS_REPOSITORY } from './domain/ports/progress-repository.port';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm-user.repository';
import { TypeOrmProgressRepository } from './infrastructure/persistence/typeorm-progress.repository';
import { GetMeUseCase } from './application/use-cases/get-me.use-case';
import { GetMyProgressUseCase } from './application/use-cases/get-my-progress.use-case';
import { UpdateMyProfileUseCase } from './application/use-cases/update-my-profile.use-case';
import { UploadMyProfilePhotoUseCase } from './application/use-cases/upload-my-profile-photo.use-case';
import { UsersController } from './presentation/http/users.controller';
import { PROFILE_PHOTO_STORAGE } from './domain/ports/profile-photo-storage.port';
import { CloudinaryProfilePhotoStorageAdapter } from './infrastructure/storage/cloudinary-profile-photo-storage.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserTypeOrmEntity,
      StudentMaterialAccessTypeOrmEntity,
      ExamAttemptTypeOrmEntity,
      CertificateTypeOrmEntity,
    ]),
  ],
  controllers: [UsersController],
  providers: [
    GetMeUseCase,
    GetMyProgressUseCase,
    UpdateMyProfileUseCase,
    UploadMyProfilePhotoUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: PROFILE_PHOTO_STORAGE,
      useClass: CloudinaryProfilePhotoStorageAdapter,
    },
    {
      provide: PROGRESS_REPOSITORY,
      useClass: TypeOrmProgressRepository,
    },
  ],
  exports: [USER_REPOSITORY, TypeOrmModule],
})
export class UsersModule {}
