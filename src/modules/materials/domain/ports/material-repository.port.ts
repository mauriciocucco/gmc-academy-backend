import { Material } from '../material';
import { MaterialCategory, MaterialLink } from '../material';

export const MATERIAL_REPOSITORY = Symbol('MATERIAL_REPOSITORY');

export type CreateMaterialPayload = {
  title: string;
  description: string;
  published: boolean;
  categoryKey: string;
  links: Array<Pick<MaterialLink, 'sourceType' | 'url' | 'label' | 'position'>>;
  createdById: string;
};

export type UpdateMaterialPayload = Partial<
  Omit<CreateMaterialPayload, 'createdById'>
>;

export type UpdateMaterialCategoryPayload = {
  key?: string;
  name?: string;
};

export type StudentMaterialAssignment = {
  materialId: string;
  position: number;
};

export interface MaterialRepositoryPort {
  findAll(): Promise<Material[]>;
  findAssignedToStudent(studentId: string): Promise<Material[]>;
  findById(id: string): Promise<Material | null>;
  findByIds(ids: string[]): Promise<Material[]>;
  create(payload: CreateMaterialPayload): Promise<Material>;
  update(id: string, payload: UpdateMaterialPayload): Promise<Material | null>;
  delete(id: string): Promise<void>;
  listCategories(): Promise<MaterialCategory[]>;
  findCategoryById(id: string): Promise<MaterialCategory | null>;
  createCategory(payload: {
    key: string;
    name: string;
  }): Promise<MaterialCategory>;
  updateCategory(
    id: string,
    payload: UpdateMaterialCategoryPayload,
  ): Promise<MaterialCategory | null>;
  deleteCategory(id: string): Promise<void>;
  categoryHasMaterials(categoryId: string): Promise<boolean>;
  listStudentAssignments(
    studentId: string,
  ): Promise<StudentMaterialAssignment[]>;
  replaceStudentAssignments(payload: {
    studentId: string;
    assignments: StudentMaterialAssignment[];
  }): Promise<StudentMaterialAssignment[]>;
  setStudentAccess(payload: {
    materialId: string;
    studentId: string;
    enabled: boolean;
  }): Promise<void>;
  hasStudentAccessToMaterial(
    materialId: string,
    studentId: string,
  ): Promise<boolean>;
  markAsViewed(materialId: string, studentId: string): Promise<void>;
  unmarkAsViewed(materialId: string, studentId: string): Promise<void>;
  countAssignedAndViewedForStudent(
    studentId: string,
  ): Promise<{ total: number; viewed: number }>;
}
