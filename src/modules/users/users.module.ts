import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTypeOrmEntity } from '../../database/typeorm/entities/user.typeorm-entity';
import { USER_REPOSITORY } from './domain/ports/user-repository.port';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm-user.repository';
import { GetMeUseCase } from './application/use-cases/get-me.use-case';
import { UsersController } from './presentation/http/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserTypeOrmEntity])],
  controllers: [UsersController],
  providers: [
    GetMeUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
  ],
  exports: [USER_REPOSITORY, TypeOrmModule],
})
export class UsersModule {}
