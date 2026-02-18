import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { CertificateDocumentBuilderPort } from '../../domain/ports/certificate-document-builder.port';
import { CertificatePdfData } from '../../domain/ports/certificate-pdf-repository.port';

@Injectable()
export class PdfkitCertificateDocumentBuilder implements CertificateDocumentBuilderPort {
  async buildPdf(data: CertificatePdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(24).text('GMC Academy', { align: 'center' }).moveDown(0.5);
      doc
        .fontSize(20)
        .text('Certificate of Completion', { align: 'center' })
        .moveDown(1.5);
      doc
        .fontSize(12)
        .text('This certifies that', { align: 'center' })
        .moveDown(0.5);
      doc
        .fontSize(18)
        .text(data.studentName, { align: 'center' })
        .moveDown(0.75);
      doc
        .fontSize(12)
        .text('successfully completed the training and approved the exam', {
          align: 'center',
        })
        .moveDown(1);
      doc.fontSize(14).text(data.examTitle, { align: 'center' }).moveDown(1.5);

      doc.fontSize(11).text(`Score: ${data.attemptScore.toFixed(2)} / 100`, {
        align: 'center',
      });
      doc.text(`Certificate Code: ${data.certificateCode}`, {
        align: 'center',
      });
      doc.text(`Issued At: ${data.issuedAt.toISOString().slice(0, 10)}`, {
        align: 'center',
      });
      doc.text(`Student Email: ${data.studentEmail}`, { align: 'center' });

      doc.end();
    });
  }
}
