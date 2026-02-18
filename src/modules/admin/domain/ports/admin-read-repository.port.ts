export const ADMIN_READ_REPOSITORY = Symbol('ADMIN_READ_REPOSITORY');

export type AdminStudentItem = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  lastAttemptScore: number | null;
  approved: boolean;
};

export type AdminStats = {
  totalStudents: number;
  totalAttempts: number;
  approvedAttempts: number;
  approvedStudents: number;
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
  listStudentsWithLatestAttempt(): Promise<AdminStudentItem[]>;
  getStats(): Promise<AdminStats>;
  getPerformance(): Promise<AdminPerformance>;
}
