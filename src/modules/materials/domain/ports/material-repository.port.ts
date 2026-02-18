import { Material } from '../material';
import { MaterialCategory, MaterialLink } from '../material';

export const MATERIAL_REPOSITORY = Symbol('MATERIAL_REPOSITORY');

export type CreateMaterialPayload = {
  title: string;
  description: string;
  published: boolean;
  categoryKey: string;
  links: Array<Pick<MaterialLink, 'sourceType' | 'url' | 'position'>>;
  createdById: string;
};

export type UpdateMaterialPayload = Partial<
  Omit<CreateMaterialPayload, 'createdById'>
>;

export interface MaterialRepositoryPort {
  findAll(): Promise<Material[]>;
  findEnabledForStudent(studentId: string): Promise<Material[]>;
  findById(id: string): Promise<Material | null>;
  create(payload: CreateMaterialPayload): Promise<Material>;
  update(id: string, payload: UpdateMaterialPayload): Promise<Material | null>;
  delete(id: string): Promise<void>;
  listCategories(): Promise<MaterialCategory[]>;
  createCategory(payload: {
    key: string;
    name: string;
  }): Promise<MaterialCategory>;
  setStudentAccess(payload: {
    materialId: string;
    studentId: string;
    enabled: boolean;
    enabledById: string;
  }): Promise<void>;
  markAsViewed(materialId: string, studentId: string): Promise<void>;
  unmarkAsViewed(materialId: string, studentId: string): Promise<void>;
  countEnabledAndViewedForStudent(
    studentId: string,
  ): Promise<{ total: number; viewed: number }>;
}
