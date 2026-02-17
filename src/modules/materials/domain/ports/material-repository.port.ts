import { Material } from '../material';

export const MATERIAL_REPOSITORY = Symbol('MATERIAL_REPOSITORY');

export interface MaterialRepositoryPort {
  findAll(): Promise<Material[]>;
  findPublished(): Promise<Material[]>;
  findById(id: string): Promise<Material | null>;
  create(payload: Omit<Material, 'id' | 'createdAt'>): Promise<Material>;
  update(
    id: string,
    payload: Partial<Omit<Material, 'id' | 'createdAt' | 'createdById'>>,
  ): Promise<Material | null>;
  delete(id: string): Promise<void>;
}
