export const CERTIFICATE_READ_REPOSITORY = Symbol(
  'CERTIFICATE_READ_REPOSITORY',
);

export type LatestCertificate = {
  id: string;
  certificateCode: string;
  issuedAt: Date;
  pdfPath: string | null;
  examTitle: string;
  attemptScore: number;
};

export interface CertificateReadRepositoryPort {
  findLatestForStudent(studentId: string): Promise<LatestCertificate | null>;
}
