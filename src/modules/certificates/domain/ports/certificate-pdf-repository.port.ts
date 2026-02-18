export type CertificatePdfData = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  certificateCode: string;
  issuedAt: Date;
  examTitle: string;
  attemptScore: number;
  pdfUrl: string | null;
};

export const CERTIFICATE_PDF_REPOSITORY = Symbol('CERTIFICATE_PDF_REPOSITORY');

export interface CertificatePdfRepositoryPort {
  findLatestByStudent(studentId: string): Promise<CertificatePdfData | null>;
  updatePdfUrl(certificateId: string, pdfUrl: string): Promise<void>;
}
