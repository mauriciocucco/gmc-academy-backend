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
    profilePhotoUrl?: string | null;
    passwordHash: string;
    role: User['role'];
  }): Promise<User> {
    const entity = this.repository.create({
      email: payload.email.toLowerCase().trim(),
      fullName: payload.fullName,
      phone: payload.phone,
      profilePhotoUrl: payload.profilePhotoUrl ?? null,
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

  async updateProfile(payload: {
    userId: string;
    fullName?: string;
    phone?: string | null;
    email?: string;
  }): Promise<User> {
    await this.repository.update(
      { id: payload.userId },
      {
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email ? payload.email.toLowerCase().trim() : undefined,
      },
    );
    const updated = await this.repository.findOne({
      where: { id: payload.userId },
    });
    return this.toDomain(updated as UserTypeOrmEntity);
  }

  async updateProfilePhoto(
    userId: string,
    profilePhotoUrl: string,
  ): Promise<User> {
    await this.repository.update({ id: userId }, { profilePhotoUrl });
    const updated = await this.repository.findOne({ where: { id: userId } });
    return this.toDomain(updated as UserTypeOrmEntity);
  }

  private toDomain(entity: UserTypeOrmEntity): User {
    return {
      id: entity.id,
      email: entity.email,
      fullName: entity.fullName,
      phone: entity.phone,
      profilePhotoUrl: entity.profilePhotoUrl,
      role: entity.role,
      passwordHash: entity.passwordHash,
      refreshTokenHash: entity.refreshTokenHash,
      createdAt: entity.createdAt,
    };
  }
}
