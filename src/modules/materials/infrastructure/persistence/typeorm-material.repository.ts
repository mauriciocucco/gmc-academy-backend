import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialRepositoryPort } from '../../domain/ports/material-repository.port';
import { Material } from '../../domain/material';
import { MaterialTypeOrmEntity } from '../../../../database/typeorm/entities/material.typeorm-entity';

@Injectable()
export class TypeOrmMaterialRepository implements MaterialRepositoryPort {
  constructor(
    @InjectRepository(MaterialTypeOrmEntity)
    private readonly repository: Repository<MaterialTypeOrmEntity>,
  ) {}

  async findAll(): Promise<Material[]> {
    const entities = await this.repository.find({
      order: {
        createdAt: 'DESC',
      },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findPublished(): Promise<Material[]> {
    const entities = await this.repository.find({
      where: { published: true },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findById(id: string): Promise<Material | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async create(payload: Omit<Material, 'id' | 'createdAt'>): Promise<Material> {
    const entity = this.repository.create(payload);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(
    id: string,
    payload: Partial<Omit<Material, 'id' | 'createdAt' | 'createdById'>>,
  ): Promise<Material | null> {
    await this.repository.update({ id }, payload);
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  private toDomain(entity: MaterialTypeOrmEntity): Material {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      driveUrl: entity.driveUrl,
      category: entity.category,
      published: entity.published,
      createdById: entity.createdById,
      createdAt: entity.createdAt,
    };
  }
}
