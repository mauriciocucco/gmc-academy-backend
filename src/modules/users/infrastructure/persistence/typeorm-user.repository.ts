import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { User } from '../../domain/user';
import { UserTypeOrmEntity } from '../../../../database/typeorm/entities/user.typeorm-entity';

@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserTypeOrmEntity)
    private readonly repository: Repository<UserTypeOrmEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { email: email.toLowerCase().trim() },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(payload: {
    email: string;
    fullName: string;
    phone?: string | null;
    passwordHash: string;
    role: User['role'];
  }): Promise<User> {
    const entity = this.repository.create({
      email: payload.email.toLowerCase().trim(),
      fullName: payload.fullName,
      phone: payload.phone,
      passwordHash: payload.passwordHash,
      role: payload.role,
    });
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async saveRefreshTokenHash(
    userId: string,
    refreshTokenHash: string,
  ): Promise<void> {
    await this.repository.update({ id: userId }, { refreshTokenHash });
  }

  async clearRefreshTokenHash(userId: string): Promise<void> {
    await this.repository.update({ id: userId }, { refreshTokenHash: null });
  }

  private toDomain(entity: UserTypeOrmEntity): User {
    return {
      id: entity.id,
      email: entity.email,
      fullName: entity.fullName,
      phone: entity.phone,
      role: entity.role,
      passwordHash: entity.passwordHash,
      refreshTokenHash: entity.refreshTokenHash,
      createdAt: entity.createdAt,
    };
  }
}
