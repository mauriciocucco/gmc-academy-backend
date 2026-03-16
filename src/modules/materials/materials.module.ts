import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialTypeOrmEntity } from '../../database/typeorm/entities/material.typeorm-entity';
import { MaterialCategoryTypeOrmEntity } from '../../database/typeorm/entities/material-category.typeorm-entity';
import { MaterialLinkTypeOrmEntity } from '../../database/typeorm/entities/material-link.typeorm-entity';
import { StudentMaterialAccessTypeOrmEntity } from '../../database/typeorm/entities/student-material-access.typeorm-entity';
import { StudentMaterialAssignmentTypeOrmEntity } from '../../database/typeorm/entities/student-material-assignment.typeorm-entity';
import { MaterialsController } from './presentation/http/materials.controller';
import { AdminMaterialsController } from './presentation/http/admin-materials.controller';
import { MATERIAL_REPOSITORY } from './domain/ports/material-repository.port';
import { TypeOrmMaterialRepository } from './infrastructure/persistence/typeorm-material.repository';
import { ListMaterialsUseCase } from './application/use-cases/list-materials.use-case';
import { ListAdminMaterialsUseCase } from './application/use-cases/list-admin-materials.use-case';
import { CreateMaterialUseCase } from './application/use-cases/create-material.use-case';
import { UpdateMaterialUseCase } from './application/use-cases/update-material.use-case';
import { DeleteMaterialUseCase } from './application/use-cases/delete-material.use-case';
import { ListMaterialCategoriesUseCase } from './application/use-cases/list-material-categories.use-case';
import { CreateMaterialCategoryUseCase } from './application/use-cases/create-material-category.use-case';
import { GetMaterialCategoryUseCase } from './application/use-cases/get-material-category.use-case';
import { UpdateMaterialCategoryUseCase } from './application/use-cases/update-material-category.use-case';
import { DeleteMaterialCategoryUseCase } from './application/use-cases/delete-material-category.use-case';
import { SetStudentMaterialAccessUseCase } from './application/use-cases/set-student-material-access.use-case';
import { SetMaterialViewedUseCase } from './application/use-cases/set-material-viewed.use-case';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      MaterialTypeOrmEntity,
      MaterialCategoryTypeOrmEntity,
      MaterialLinkTypeOrmEntity,
      StudentMaterialAccessTypeOrmEntity,
      StudentMaterialAssignmentTypeOrmEntity,
    ]),
  ],
  controllers: [MaterialsController, AdminMaterialsController],
  providers: [
    ListMaterialsUseCase,
    ListAdminMaterialsUseCase,
    ListMaterialCategoriesUseCase,
    CreateMaterialUseCase,
    CreateMaterialCategoryUseCase,
    GetMaterialCategoryUseCase,
    UpdateMaterialCategoryUseCase,
    DeleteMaterialCategoryUseCase,
    UpdateMaterialUseCase,
    DeleteMaterialUseCase,
    SetStudentMaterialAccessUseCase,
    SetMaterialViewedUseCase,
    {
      provide: MATERIAL_REPOSITORY,
      useClass: TypeOrmMaterialRepository,
    },
  ],
  exports: [MATERIAL_REPOSITORY],
})
export class MaterialsModule {}
