export const ADMIN_READ_REPOSITORY = Symbol('ADMIN_READ_REPOSITORY');

export type AdminStudentListItem = {
  id: string;
  fullName: string;
  email: string;
  lastAttemptScore: number | null;
  approved: boolean;
};

export type ListAdminStudentsFilters = {
  page: number;
  pageSize: number;
  search?: string;
  status: 'all' | 'approved' | 'pending';
  attemptState: 'all' | 'with-attempt' | 'without-attempt';
};

export type AdminStudentListResult = {
  items: AdminStudentListItem[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

export type AdminStats = {
  totalStudents: number;
  approvedStudents: number;
  approvalRate: number;
  averageScore: number;
};

export type AdminPerformanceByExam = {
  examId: string;
  examTitle: string;
  attempts: number;
  passRate: number;
  averageScore: number;
  questionCount: number;
};

export type AdminPerformanceByStudent = {
  studentId: string;
  fullName: string;
  email: string;
  attempts: number;
  averageScore: number;
  bestScore: number | null;
  latestScore: number | null;
  latestPassed: boolean | null;
};

export type AdminPerformance = {
  overall: {
    averageScore: number;
    passRate: number;
    totalAttempts: number;
  };
  byExam: AdminPerformanceByExam[];
  byStudent: AdminPerformanceByStudent[];
};

export interface AdminReadRepositoryPort {
  listStudentsWithLatestAttempt(
    filters: ListAdminStudentsFilters,
  ): Promise<AdminStudentListResult>;
  getStats(): Promise<AdminStats>;
  getPerformance(): Promise<AdminPerformance>;
}
