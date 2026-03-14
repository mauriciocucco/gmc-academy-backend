import { ApiProperty } from '@nestjs/swagger';

export class AdminStudentProgressResponseDto {
  @ApiProperty()
  materialsTotal!: number;

  @ApiProperty()
  materialsViewed!: number;

  @ApiProperty()
  examPassed!: boolean;

  @ApiProperty()
  certificateIssued!: boolean;
}

export class AdminStudentStatsResponseDto {
  @ApiProperty()
  totalAttempts!: number;

  @ApiProperty()
  passedAttempts!: number;

  @ApiProperty()
  failedAttempts!: number;

  @ApiProperty({ nullable: true })
  bestScore!: number | null;

  @ApiProperty({ nullable: true })
  averageScore!: number | null;

  @ApiProperty({ nullable: true, format: 'date-time' })
  lastAttemptAt!: string | null;

  @ApiProperty({ nullable: true, format: 'date-time' })
  lastPassedAt!: string | null;
}

export class AdminStudentNoteResponseDto {
  @ApiProperty()
  content!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;

  @ApiProperty()
  updatedByName!: string;
}

export class AdminStudentDetailResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ nullable: true })
  phone!: string | null;

  @ApiProperty({ nullable: true })
  profilePhotoUrl!: string | null;

  @ApiProperty()
  approved!: boolean;

  @ApiProperty({ nullable: true })
  lastAttemptScore!: number | null;

  @ApiProperty({
    nullable: true,
    type: AdminStudentNoteResponseDto,
  })
  note!: AdminStudentNoteResponseDto | null;

  @ApiProperty({ type: AdminStudentProgressResponseDto })
  progress!: AdminStudentProgressResponseDto;

  @ApiProperty({ type: AdminStudentStatsResponseDto })
  stats!: AdminStudentStatsResponseDto;
}
