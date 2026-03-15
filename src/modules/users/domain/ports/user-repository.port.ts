import { User } from '../user';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByIds(ids: string[]): Promise<User[]>;
  findByEmail(email: string): Promise<User | null>;
  create(payload: {
    email: string;
    fullName: string;
    phone?: string | null;
    profilePhotoUrl?: string | null;
    passwordHash: string;
    role: User['role'];
    mustChangePassword?: boolean;
  }): Promise<User>;
  saveRefreshTokenHash(userId: string, refreshTokenHash: string): Promise<void>;
  clearRefreshTokenHash(userId: string): Promise<void>;
  updatePassword(payload: {
    userId: string;
    passwordHash: string;
    mustChangePassword: boolean;
    clearRefreshTokenHash?: boolean;
  }): Promise<User>;
  updateProfile(payload: {
    userId: string;
    fullName?: string;
    phone?: string | null;
    email?: string;
  }): Promise<User>;
  updateProfilePhoto(userId: string, profilePhotoUrl: string): Promise<User>;
  updateAccessStatus(payload: {
    userIds: string[];
    blocked: boolean;
    blockedByUserId?: string | null;
    reason?: string | null;
  }): Promise<void>;
}
