import { ApiProperty } from '@nestjs/swagger';

export class StudentProgressResponseDto {
  @ApiProperty({ description: 'Total enabled materials for the student' })
  materialsTotal!: number;

  @ApiProperty({ description: 'Materials the student has actually opened' })
  materialsViewed!: number;

  @ApiProperty({ description: 'Whether the student has passed any exam' })
  examPassed!: boolean;

  @ApiProperty({ description: 'Whether a certificate has been issued' })
  certificateIssued!: boolean;
}
