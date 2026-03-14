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
        layout: 'landscape',
        margin: 0,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const accent = '#0066CC';
      const accentDark = '#0A3A75';
      const ink = '#0F172A';
      const muted = '#475569';
      const pale = '#F7FAFF';
      const gold = '#C6932D';
      const outerMargin = 28;
      const innerMargin = 44;
      const contentWidth = pageWidth - innerMargin * 2;
      const studentName = data.studentName.trim() || 'Alumno';
      const examTitle = data.examTitle.trim() || 'Programa teorico de conduccion';
      const issueDate = this.formatIssuedAt(data.issuedAt);
      const scoreLabel = `${data.attemptScore.toFixed(2)} / 100`;

      doc.save();
      doc.rect(0, 0, pageWidth, pageHeight).fill('#EEF4FB');
      doc.restore();

      doc.save();
      doc
        .polygon(
          [0, 0],
          [pageWidth * 0.34, 0],
          [pageWidth * 0.19, pageHeight],
          [0, pageHeight],
        )
        .fill(accentDark);
      doc.restore();

      doc.save();
      doc
        .polygon(
          [pageWidth * 0.8, 0],
          [pageWidth, 0],
          [pageWidth, pageHeight * 0.38],
          [pageWidth * 0.68, pageHeight * 0.18],
        )
        .fill(accent);
      doc.restore();

      doc
        .roundedRect(
          outerMargin,
          outerMargin,
          pageWidth - outerMargin * 2,
          pageHeight - outerMargin * 2,
          18,
        )
        .fillAndStroke('#FFFFFF', '#D7E3F4');

      doc
        .roundedRect(
          outerMargin + 10,
          outerMargin + 10,
          pageWidth - (outerMargin + 10) * 2,
          pageHeight - (outerMargin + 10) * 2,
          14,
        )
        .lineWidth(1.5)
        .stroke('#B9CCE4');

      doc.save();
      doc
        .circle(pageWidth - 92, 92, 42)
        .fillOpacity(0.1)
        .fill(gold);
      doc.restore();
      doc.circle(pageWidth - 92, 92, 34).lineWidth(3).stroke(gold);
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(gold)
        .text('GMC', pageWidth - 112, 84, {
          width: 40,
          align: 'center',
        });
      doc
        .font('Helvetica')
        .fontSize(7)
        .text('AUTOESCUELA', pageWidth - 124, 97, {
          width: 64,
          align: 'center',
        });

      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor(accent)
        .text('AUTOESCUELA GMC', innerMargin, 58, {
          width: contentWidth,
          align: 'center',
        });
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(muted)
        .text('Formacion vial teorica | Certificacion academica', innerMargin, 80, {
          width: contentWidth,
          align: 'center',
        });

      doc
        .moveTo(pageWidth / 2 - 84, 112)
        .lineTo(pageWidth / 2 + 84, 112)
        .lineWidth(2)
        .stroke(accent);

      doc
        .font('Helvetica-Bold')
        .fontSize(31)
        .fillColor(ink)
        .text('Certificado de Aprobacion', innerMargin, 136, {
          width: contentWidth,
          align: 'center',
        });

      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor(muted)
        .text('Se deja constancia de que', innerMargin, 188, {
          width: contentWidth,
          align: 'center',
        });

      doc
        .font('Helvetica-Bold')
        .fontSize(28)
        .fillColor(accentDark)
        .text(studentName, innerMargin + 70, 215, {
          width: contentWidth - 140,
          align: 'center',
          underline: true,
        });

      doc
        .font('Helvetica')
        .fontSize(13)
        .fillColor(ink)
        .text(
          'ha completado satisfactoriamente la instancia de formacion y aprobado la evaluacion teorica correspondiente a la Autoescuela GMC.',
          innerMargin + 94,
          274,
          {
            width: contentWidth - 188,
            align: 'center',
          },
        );

      doc
        .roundedRect(innerMargin + 122, 336, contentWidth - 244, 54, 14)
        .fillAndStroke(pale, '#D6E3F2');
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(accent)
        .text('EVALUACION', innerMargin + 138, 349, {
          width: contentWidth - 276,
          align: 'center',
        });
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .fillColor(ink)
        .text(examTitle, innerMargin + 138, 364, {
          width: contentWidth - 276,
          align: 'center',
          ellipsis: true,
        });

      const statY = 430;
      const statHeight = 66;
      const statGap = 18;
      const statWidth = (contentWidth - statGap * 2) / 3;
      const statX = innerMargin;

      this.drawStatCard(doc, {
        x: statX,
        y: statY,
        width: statWidth,
        height: statHeight,
        label: 'Fecha de emision',
        value: issueDate,
        accent,
      });
      this.drawStatCard(doc, {
        x: statX + statWidth + statGap,
        y: statY,
        width: statWidth,
        height: statHeight,
        label: 'Calificacion final',
        value: scoreLabel,
        accent,
      });
      this.drawStatCard(doc, {
        x: statX + (statWidth + statGap) * 2,
        y: statY,
        width: statWidth,
        height: statHeight,
        label: 'Codigo de validacion',
        value: data.certificateCode,
        accent,
      });

      const signatureWidth = 230;
      const signatureX = (pageWidth - signatureWidth) / 2;
      const signatureY = 522;
      doc
        .moveTo(signatureX, signatureY)
        .lineTo(signatureX + signatureWidth, signatureY)
        .lineWidth(1)
        .stroke('#94A3B8');

      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(ink)
        .text('Direccion Academica GMC', signatureX, signatureY + 12, {
          width: signatureWidth,
          align: 'center',
        });
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(muted)
        .text('Autoescuela GMC', signatureX, signatureY + 28, {
          width: signatureWidth,
          align: 'center',
        });

      const footerY = pageHeight - 34;
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#64748B')
        .text(
          'Documento emitido por Autoescuela GMC. La validez puede verificarse con el codigo indicado en este certificado.',
          innerMargin,
          footerY,
          {
            width: contentWidth,
            align: 'center',
          },
        );

      doc.end();
    });
  }

  private drawStatCard(
    doc: PDFKit.PDFDocument,
    input: {
      x: number;
      y: number;
      width: number;
      height: number;
      label: string;
      value: string;
      accent: string;
    },
  ): void {
    doc
      .roundedRect(input.x, input.y, input.width, input.height, 12)
      .fillAndStroke('#FFFFFF', '#D6E3F2');
    doc
      .roundedRect(input.x, input.y, input.width, 6, 12)
      .fill(input.accent);
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#64748B')
      .text(input.label, input.x + 16, input.y + 18, {
        width: input.width - 32,
        align: 'center',
      });
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#0F172A')
      .text(input.value, input.x + 16, input.y + 34, {
        width: input.width - 32,
        align: 'center',
        ellipsis: true,
      });
  }

  private formatIssuedAt(date: Date): string {
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }
}
