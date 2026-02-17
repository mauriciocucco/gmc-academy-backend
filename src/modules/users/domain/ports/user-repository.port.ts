import { User } from '../user';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(
    payload: Pick<User, 'email' | 'fullName' | 'passwordHash' | 'role'>,
  ): Promise<User>;
  saveRefreshTokenHash(userId: string, refreshTokenHash: string): Promise<void>;
  clearRefreshTokenHash(userId: string): Promise<void>;
}
