import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LatestCertificateResponseDto {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  studentName!: string;

  @ApiProperty()
  score!: number;

  @ApiProperty({ format: 'date-time' })
  issuedAt!: string;

  @ApiProperty({
    nullable: true,
    description: 'Temporary signed download URL for the certificate PDF',
  })
  pdfUrl!: string | null;

  @ApiPropertyOptional()
  examTitle?: string;
}
