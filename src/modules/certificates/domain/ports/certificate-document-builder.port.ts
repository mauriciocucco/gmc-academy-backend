import { CertificatePdfData } from './certificate-pdf-repository.port';

export const CERTIFICATE_DOCUMENT_BUILDER = Symbol(
  'CERTIFICATE_DOCUMENT_BUILDER',
);

export interface CertificateDocumentBuilderPort {
  buildPdf(data: CertificatePdfData): Promise<Buffer>;
}
