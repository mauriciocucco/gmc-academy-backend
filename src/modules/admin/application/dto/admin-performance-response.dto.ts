import { ApiProperty } from '@nestjs/swagger';

export class AdminPerformanceOverallDto {
  @ApiProperty()
  averageScore!: number;

  @ApiProperty()
  passRate!: number;

  @ApiProperty()
  totalAttempts!: number;
}

export class AdminPerformanceByExamDto {
  @ApiProperty()
  examId!: string;

  @ApiProperty()
  examTitle!: string;

  @ApiProperty()
  attempts!: number;

  @ApiProperty()
  passRate!: number;

  @ApiProperty()
  averageScore!: number;

  @ApiProperty()
  questionCount!: number;
}

export class AdminPerformanceByStudentDto {
  @ApiProperty()
  studentId!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  attempts!: number;

  @ApiProperty()
  averageScore!: number;

  @ApiProperty({ nullable: true })
  bestScore!: number | null;

  @ApiProperty({ nullable: true })
  latestScore!: number | null;

  @ApiProperty({ nullable: true })
  latestPassed!: boolean | null;
}

export class AdminPerformanceResponseDto {
  @ApiProperty({ type: AdminPerformanceOverallDto })
  overall!: AdminPerformanceOverallDto;

  @ApiProperty({ type: [AdminPerformanceByExamDto] })
  byExam!: AdminPerformanceByExamDto[];

  @ApiProperty({ type: [AdminPerformanceByStudentDto] })
  byStudent!: AdminPerformanceByStudentDto[];
}
