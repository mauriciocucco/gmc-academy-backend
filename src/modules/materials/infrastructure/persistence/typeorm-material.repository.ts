import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  CreateMaterialPayload,
  MaterialRepositoryPort,
  UpdateMaterialPayload,
} from '../../domain/ports/material-repository.port';
import { Material, MaterialCategory } from '../../domain/material';
import { MaterialTypeOrmEntity } from '../../../../database/typeorm/entities/material.typeorm-entity';
import { MaterialCategoryTypeOrmEntity } from '../../../../database/typeorm/entities/material-category.typeorm-entity';
import { MaterialLinkTypeOrmEntity } from '../../../../database/typeorm/entities/material-link.typeorm-entity';
import { StudentMaterialAccessTypeOrmEntity } from '../../../../database/typeorm/entities/student-material-access.typeorm-entity';

@Injectable()
export class TypeOrmMaterialRepository implements MaterialRepositoryPort {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(MaterialTypeOrmEntity)
    private readonly materialRepository: Repository<MaterialTypeOrmEntity>,
    @InjectRepository(MaterialCategoryTypeOrmEntity)
    private readonly categoryRepository: Repository<MaterialCategoryTypeOrmEntity>,
    @InjectRepository(MaterialLinkTypeOrmEntity)
    private readonly linkRepository: Repository<MaterialLinkTypeOrmEntity>,
    @InjectRepository(StudentMaterialAccessTypeOrmEntity)
    private readonly accessRepository: Repository<StudentMaterialAccessTypeOrmEntity>,
  ) {}

  async findAll(): Promise<Material[]> {
    const entities = await this.materialRepository.find({
      relations: ['category', 'links'],
      order: {
        createdAt: 'DESC',
        links: {
          position: 'ASC',
        },
      },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findEnabledForStudent(studentId: string): Promise<Material[]> {
    const entities = await this.materialRepository
      .createQueryBuilder('material')
      .leftJoinAndSelect('material.category', 'category')
      .leftJoinAndSelect('material.links', 'link')
      .innerJoin('material.studentAccesses', 'student_access')
      .where('material.published = true')
      .andWhere('student_access.student_id = :studentId', { studentId })
      .andWhere('student_access.enabled = true')
      .orderBy('material.created_at', 'DESC')
      .addOrderBy('link.position', 'ASC')
      .getMany();

    return entities.map((entity) => this.toDomain(entity));
  }

  async findById(id: string): Promise<Material | null> {
    const entity = await this.materialRepository.findOne({
      where: { id },
      relations: ['category', 'links'],
      order: {
        links: {
          position: 'ASC',
        },
      },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async create(payload: CreateMaterialPayload): Promise<Material> {
    return this.dataSource.transaction(async (manager) => {
      const category = await manager
        .getRepository(MaterialCategoryTypeOrmEntity)
        .findOne({
          where: { key: payload.categoryKey },
        });
      if (!category) {
        throw new NotFoundException('Material category not found');
      }

      const materialRepository = manager.getRepository(MaterialTypeOrmEntity);
      const linkRepository = manager.getRepository(MaterialLinkTypeOrmEntity);

      const material = materialRepository.create({
        title: payload.title,
        description: payload.description,
        published: payload.published,
        categoryId: category.id,
        createdById: payload.createdById,
      });
      const savedMaterial = await materialRepository.save(material);

      if (payload.links.length > 0) {
        const links = payload.links.map((link) =>
          linkRepository.create({
            materialId: savedMaterial.id,
            sourceType: link.sourceType,
            url: link.url,
            position: link.position,
          }),
        );
        await linkRepository.save(links);
      }

      const hydrated = await materialRepository.findOne({
        where: { id: savedMaterial.id },
        relations: ['category', 'links'],
      });
      if (!hydrated) {
        throw new NotFoundException('Material not found after creation');
      }

      return this.toDomain(hydrated);
    });
  }

  async update(
    id: string,
    payload: UpdateMaterialPayload,
  ): Promise<Material | null> {
    return this.dataSource.transaction(async (manager) => {
      const materialRepository = manager.getRepository(MaterialTypeOrmEntity);
      const linkRepository = manager.getRepository(MaterialLinkTypeOrmEntity);
      const current = await materialRepository.findOne({ where: { id } });
      if (!current) {
        return null;
      }

      let categoryId = current.categoryId;
      if (payload.categoryKey) {
        const category = await manager
          .getRepository(MaterialCategoryTypeOrmEntity)
          .findOne({
            where: { key: payload.categoryKey },
          });
        if (!category) {
          throw new NotFoundException('Material category not found');
        }
        categoryId = category.id;
      }

      await materialRepository.update(
        { id },
        {
          title: payload.title ?? current.title,
          description: payload.description ?? current.description,
          published: payload.published ?? current.published,
          categoryId,
        },
      );

      if (payload.links) {
        await linkRepository.delete({ materialId: id });
        if (payload.links.length > 0) {
          await linkRepository.save(
            payload.links.map((link) =>
              linkRepository.create({
                materialId: id,
                sourceType: link.sourceType,
                url: link.url,
                position: link.position,
              }),
            ),
          );
        }
      }

      const hydrated = await materialRepository.findOne({
        where: { id },
        relations: ['category', 'links'],
      });

      return hydrated ? this.toDomain(hydrated) : null;
    });
  }

  async delete(id: string): Promise<void> {
    await this.materialRepository.delete({ id });
  }

  async listCategories(): Promise<MaterialCategory[]> {
    const categories = await this.categoryRepository.find({
      order: { name: 'ASC' },
    });

    return categories.map((category) => ({
      id: category.id,
      key: category.key,
      name: category.name,
    }));
  }

  async createCategory(payload: {
    key: string;
    name: string;
  }): Promise<MaterialCategory> {
    const category = this.categoryRepository.create({
      key: payload.key,
      name: payload.name,
    });
    const saved = await this.categoryRepository.save(category);
    return {
      id: saved.id,
      key: saved.key,
      name: saved.name,
    };
  }

  async setStudentAccess(payload: {
    materialId: string;
    studentId: string;
    enabled: boolean;
    enabledById: string;
  }): Promise<void> {
    await this.accessRepository.upsert(
      {
        materialId: payload.materialId,
        studentId: payload.studentId,
        enabled: payload.enabled,
        enabledById: payload.enabledById,
        enabledAt: payload.enabled ? new Date() : null,
      },
      ['materialId', 'studentId'],
    );
  }

  private toDomain(entity: MaterialTypeOrmEntity): Material {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      published: entity.published,
      category: {
        id: entity.category.id,
        key: entity.category.key,
        name: entity.category.name,
      },
      links: (entity.links ?? []).map((link) => ({
        id: link.id,
        sourceType: link.sourceType,
        url: link.url,
        position: link.position,
      })),
      createdById: entity.createdById,
      createdAt: entity.createdAt,
    };
  }
}
