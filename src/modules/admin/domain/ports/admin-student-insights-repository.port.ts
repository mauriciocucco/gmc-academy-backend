export const ADMIN_STUDENT_INSIGHTS_REPOSITORY = Symbol(
  'ADMIN_STUDENT_INSIGHTS_REPOSITORY',
);

export type AdminStudentNote = {
  content: string;
  updatedAt: Date;
  updatedByName: string;
};

export type SaveAdminStudentNoteInput = {
  studentId: string;
  content: string;
  updatedById: string;
};

export type AdminStudentMaterialProgressItem = {
  materialId: string;
  title: string;
  description: string;
  category: {
    id: string;
    key: string;
    name: string;
  };
  position: number;
  viewed: boolean;
  viewedAt: Date | null;
  linksCount: number;
};

export interface AdminStudentInsightsRepositoryPort {
  findStudentNote(studentId: string): Promise<AdminStudentNote | null>;
  saveStudentNote(input: SaveAdminStudentNoteInput): Promise<AdminStudentNote>;
  listStudentMaterialsProgress(
    studentId: string,
  ): Promise<AdminStudentMaterialProgressItem[]>;
}
