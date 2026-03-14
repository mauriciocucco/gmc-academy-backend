export const CERTIFICATE_READ_REPOSITORY = Symbol(
  'CERTIFICATE_READ_REPOSITORY',
);

export type LatestCertificate = {
  code: string;
  studentName: string;
  score: number;
  issuedAt: Date;
  pdfUrl: string | null;
  examTitle?: string;
};

export interface CertificateReadRepositoryPort {
  findLatestForStudent(studentId: string): Promise<LatestCertificate | null>;
}
