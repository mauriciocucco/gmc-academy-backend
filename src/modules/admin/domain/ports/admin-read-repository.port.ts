export const ADMIN_READ_REPOSITORY = Symbol('ADMIN_READ_REPOSITORY');

export type AdminStudentItem = {
  id: string;
  fullName: string;
  email: string;
  lastAttemptScore: number | null;
  approved: boolean;
};

export type AdminStats = {
  totalStudents: number;
  totalAttempts: number;
  approvedAttempts: number;
  approvedStudents: number;
};

export interface AdminReadRepositoryPort {
  listStudentsWithLatestAttempt(): Promise<AdminStudentItem[]>;
  getStats(): Promise<AdminStats>;
}
