import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialTypeOrmEntity } from '../../database/typeorm/entities/material.typeorm-entity';
import { MaterialCategoryTypeOrmEntity } from '../../database/typeorm/entities/material-category.typeorm-entity';
import { MaterialLinkTypeOrmEntity } from '../../database/typeorm/entities/material-link.typeorm-entity';
import { StudentMaterialAccessTypeOrmEntity } from '../../database/typeorm/entities/student-material-access.typeorm-entity';
import { MaterialsController } from './presentation/http/materials.controller';
import { MATERIAL_REPOSITORY } from './domain/ports/material-repository.port';
import { TypeOrmMaterialRepository } from './infrastructure/persistence/typeorm-material.repository';
import { ListMaterialsUseCase } from './application/use-cases/list-materials.use-case';
import { CreateMaterialUseCase } from './application/use-cases/create-material.use-case';
import { UpdateMaterialUseCase } from './application/use-cases/update-material.use-case';
import { DeleteMaterialUseCase } from './application/use-cases/delete-material.use-case';
import { ListMaterialCategoriesUseCase } from './application/use-cases/list-material-categories.use-case';
import { CreateMaterialCategoryUseCase } from './application/use-cases/create-material-category.use-case';
import { SetStudentMaterialAccessUseCase } from './application/use-cases/set-student-material-access.use-case';
import { MarkMaterialViewedUseCase } from './application/use-cases/mark-material-viewed.use-case';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      MaterialTypeOrmEntity,
      MaterialCategoryTypeOrmEntity,
      MaterialLinkTypeOrmEntity,
      StudentMaterialAccessTypeOrmEntity,
    ]),
  ],
  controllers: [MaterialsController],
  providers: [
    ListMaterialsUseCase,
    ListMaterialCategoriesUseCase,
    CreateMaterialUseCase,
    CreateMaterialCategoryUseCase,
    UpdateMaterialUseCase,
    DeleteMaterialUseCase,
    SetStudentMaterialAccessUseCase,
    MarkMaterialViewedUseCase,
    {
      provide: MATERIAL_REPOSITORY,
      useClass: TypeOrmMaterialRepository,
    },
  ],
})
export class MaterialsModule {}
