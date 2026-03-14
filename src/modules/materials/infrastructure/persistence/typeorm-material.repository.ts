import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import {
  CreateMaterialPayload,
  MaterialRepositoryPort,
  UpdateMaterialCategoryPayload,
  UpdateMaterialPayload,
} from '../../domain/ports/material-repository.port';
import { Material, MaterialCategory } from '../../domain/material';
import { MaterialTypeOrmEntity } from '../../../../database/typeorm/entities/material.typeorm-entity';
import { MaterialCategoryTypeOrmEntity } from '../../../../database/typeorm/entities/material-category.typeorm-entity';
import { MaterialLinkTypeOrmEntity } from '../../../../database/typeorm/entities/material-link.typeorm-entity';
import { StudentMaterialAccessTypeOrmEntity } from '../../../../database/typeorm/entities/student-material-access.typeorm-entity';
import { StudentMaterialAssignmentTypeOrmEntity } from '../../../../database/typeorm/entities/student-material-assignment.typeorm-entity';

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
    @InjectRepository(StudentMaterialAssignmentTypeOrmEntity)
    private readonly assignmentRepository: Repository<StudentMaterialAssignmentTypeOrmEntity>,
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

    return entities.map((entity) => this.toDomain(entity, null));
  }

  async findAssignedToStudent(studentId: string): Promise<Material[]> {
    const rows = await this.materialRepository
      .createQueryBuilder('material')
      .leftJoinAndSelect('material.category', 'category')
      .leftJoinAndSelect('material.links', 'link')
      .innerJoin(
        'material.studentAssignments',
        'student_assignment',
        'student_assignment.student_id = :studentId',
        { studentId },
      )
      .leftJoin(
        'material.studentAccesses',
        'student_access',
        'student_access.student_id = :studentId',
        { studentId },
      )
      .addSelect('student_access.viewed_at', 'student_access_viewed_at')
      .addSelect('student_assignment.position', 'student_assignment_position')
      .where('material.published = true')
      .orderBy('student_assignment.position', 'ASC')
      .addOrderBy('link.position', 'ASC')
      .getRawAndEntities();

    return rows.entities.map((entity) => {
      const raw = rows.raw.find((r) => r.material_id === entity.id);
      const viewedAt: string | null = raw?.student_access_viewed_at ?? null;
      return this.toDomain(entity, viewedAt !== null);
    });
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

    return entity ? this.toDomain(entity, null) : null;
  }

  async findByIds(ids: string[]): Promise<Material[]> {
    if (ids.length === 0) {
      return [];
    }

    const entities = await this.materialRepository.find({
      where: { id: In(ids) },
      relations: ['category', 'links'],
      order: {
        links: {
          position: 'ASC',
        },
      },
    });

    return entities.map((entity) => this.toDomain(entity, null));
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
            label: link.label,
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

      return this.toDomain(hydrated, null);
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
                label: link.label,
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

      return hydrated ? this.toDomain(hydrated, null) : null;
    });
  }

  async delete(id: string): Promise<void> {
    await this.materialRepository.delete({ id });
  }

  async listCategories(): Promise<MaterialCategory[]> {
    const categories = await this.categoryRepository.find({
      order: { name: 'ASC' },
    });

    return categories.map((category) => this.toCategoryDomain(category));
  }

  async findCategoryById(id: string): Promise<MaterialCategory | null> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    return category ? this.toCategoryDomain(category) : null;
  }

  async createCategory(payload: {
    key: string;
    name: string;
  }): Promise<MaterialCategory> {
    const existing = await this.categoryRepository.findOne({
      where: { key: payload.key },
    });
    if (existing) {
      throw new ConflictException('Material category key is already in use');
    }

    const category = this.categoryRepository.create({
      key: payload.key,
      name: payload.name,
    });
    const saved = await this.categoryRepository.save(category);
    return this.toCategoryDomain(saved);
  }

  async updateCategory(
    id: string,
    payload: UpdateMaterialCategoryPayload,
  ): Promise<MaterialCategory | null> {
    const current = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!current) {
      return null;
    }

    if (payload.key && payload.key !== current.key) {
      const existing = await this.categoryRepository.findOne({
        where: { key: payload.key },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Material category key is already in use');
      }
    }

    current.key = payload.key ?? current.key;
    current.name = payload.name ?? current.name;

    const saved = await this.categoryRepository.save(current);
    return this.toCategoryDomain(saved);
  }

  async deleteCategory(id: string): Promise<void> {
    await this.categoryRepository.delete({ id });
  }

  async categoryHasMaterials(categoryId: string): Promise<boolean> {
    const count = await this.materialRepository.count({
      where: { categoryId },
    });

    return count > 0;
  }

  async listStudentAssignments(
    studentId: string,
  ): Promise<Array<{ materialId: string; position: number }>> {
    const assignments = await this.assignmentRepository.find({
      where: { studentId },
      order: { position: 'ASC' },
    });

    return assignments.map((assignment) => ({
      materialId: assignment.materialId,
      position: assignment.position,
    }));
  }

  async replaceStudentAssignments(payload: {
    studentId: string;
    assignments: Array<{ materialId: string; position: number }>;
  }): Promise<Array<{ materialId: string; position: number }>> {
    return this.dataSource.transaction(async (manager) => {
      const assignmentRepository = manager.getRepository(
        StudentMaterialAssignmentTypeOrmEntity,
      );

      await assignmentRepository.delete({ studentId: payload.studentId });

      if (payload.assignments.length > 0) {
        await assignmentRepository.insert(
          payload.assignments.map((assignment) => ({
            studentId: payload.studentId,
            materialId: assignment.materialId,
            position: assignment.position,
          })),
        );
      }

      const saved = await assignmentRepository.find({
        where: { studentId: payload.studentId },
        order: { position: 'ASC' },
      });

      return saved.map((assignment) => ({
        materialId: assignment.materialId,
        position: assignment.position,
      }));
    });
  }

  async setStudentAccess(payload: {
    materialId: string;
    studentId: string;
    enabled: boolean;
  }): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const assignmentRepository = manager.getRepository(
        StudentMaterialAssignmentTypeOrmEntity,
      );

      if (!payload.enabled) {
        await assignmentRepository.delete({
          materialId: payload.materialId,
          studentId: payload.studentId,
        });
        return;
      }

      const existing = await assignmentRepository.findOne({
        where: {
          materialId: payload.materialId,
          studentId: payload.studentId,
        },
      });
      if (existing) {
        return;
      }

      const rawMaxPosition = await assignmentRepository
        .createQueryBuilder('assignment')
        .select('COALESCE(MAX(assignment.position), -1)', 'maxPosition')
        .where('assignment.student_id = :studentId', {
          studentId: payload.studentId,
        })
        .getRawOne<{ maxPosition: string }>();

      await assignmentRepository.insert({
        materialId: payload.materialId,
        studentId: payload.studentId,
        position: Number(rawMaxPosition?.maxPosition ?? -1) + 1,
      });
    });
  }

  async hasStudentAccessToMaterial(
    materialId: string,
    studentId: string,
  ): Promise<boolean> {
    const count = await this.assignmentRepository
      .createQueryBuilder('assignment')
      .innerJoin('assignment.material', 'material')
      .where('assignment.student_id = :studentId', { studentId })
      .andWhere('assignment.material_id = :materialId', { materialId })
      .andWhere('material.published = true')
      .getCount();

    return count > 0;
  }

  async markAsViewed(materialId: string, studentId: string): Promise<void> {
    await this.accessRepository.query(
      `
        INSERT INTO student_material_access (material_id, student_id, viewed_at)
        VALUES ($1, $2, now())
        ON CONFLICT (material_id, student_id)
        DO UPDATE SET viewed_at = COALESCE(student_material_access.viewed_at, EXCLUDED.viewed_at);
      `,
      [materialId, studentId],
    );
  }

  async unmarkAsViewed(materialId: string, studentId: string): Promise<void> {
    await this.accessRepository
      .createQueryBuilder()
      .update()
      .set({ viewedAt: null as unknown as Date })
      .where('material_id = :materialId AND student_id = :studentId', {
        materialId,
        studentId,
      })
      .execute();
  }

  async countAssignedAndViewedForStudent(
    studentId: string,
  ): Promise<{ total: number; viewed: number }> {
    const result = await this.assignmentRepository
      .createQueryBuilder('assignment')
      .select('COUNT(*)', 'total')
      .addSelect('COUNT(access.viewed_at)', 'viewed')
      .innerJoin('assignment.material', 'material')
      .leftJoin(
        StudentMaterialAccessTypeOrmEntity,
        'access',
        'access.student_id = assignment.student_id AND access.material_id = assignment.material_id',
      )
      .where('assignment.student_id = :studentId', { studentId })
      .andWhere('material.published = true')
      .getRawOne<{ total: string; viewed: string }>();

    return {
      total: Number(result?.total ?? 0),
      viewed: Number(result?.viewed ?? 0),
    };
  }

  private toDomain(
    entity: MaterialTypeOrmEntity,
    viewed: boolean | null,
  ): Material {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      published: entity.published,
      viewed,
      category: {
        id: entity.category.id,
        key: entity.category.key,
        name: entity.category.name,
      },
      links: (entity.links ?? []).map((link) => ({
        id: link.id,
        sourceType: link.sourceType,
        url: link.url,
        label: link.label,
        position: link.position,
      })),
      createdById: entity.createdById,
      createdAt: entity.createdAt,
    };
  }

  private toCategoryDomain(
    entity: MaterialCategoryTypeOrmEntity,
  ): MaterialCategory {
    return {
      id: entity.id,
      key: entity.key,
      name: entity.name,
    };
  }
}
