export const PROGRESS_REPOSITORY = Symbol('PROGRESS_REPOSITORY');

export type StudentProgress = {
  materialsTotal: number;
  materialsViewed: number;
  examPassed: boolean;
  certificateIssued: boolean;
};

export interface ProgressRepositoryPort {
  getStudentProgress(studentId: string): Promise<StudentProgress>;
}
