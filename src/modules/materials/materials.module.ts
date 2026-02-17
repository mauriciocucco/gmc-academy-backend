import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialTypeOrmEntity } from '../../database/typeorm/entities/material.typeorm-entity';
import { MaterialsController } from './presentation/http/materials.controller';
import { MATERIAL_REPOSITORY } from './domain/ports/material-repository.port';
import { TypeOrmMaterialRepository } from './infrastructure/persistence/typeorm-material.repository';
import { ListMaterialsUseCase } from './application/use-cases/list-materials.use-case';
import { CreateMaterialUseCase } from './application/use-cases/create-material.use-case';
import { UpdateMaterialUseCase } from './application/use-cases/update-material.use-case';
import { DeleteMaterialUseCase } from './application/use-cases/delete-material.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialTypeOrmEntity])],
  controllers: [MaterialsController],
  providers: [
    ListMaterialsUseCase,
    CreateMaterialUseCase,
    UpdateMaterialUseCase,
    DeleteMaterialUseCase,
    {
      provide: MATERIAL_REPOSITORY,
      useClass: TypeOrmMaterialRepository,
    },
  ],
})
export class MaterialsModule {}
