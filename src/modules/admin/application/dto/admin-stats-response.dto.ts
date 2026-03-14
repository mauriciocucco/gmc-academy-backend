import { ApiProperty } from '@nestjs/swagger';

export class AdminStatsResponseDto {
  @ApiProperty()
  totalStudents!: number;

  @ApiProperty()
  approvedStudents!: number;

  @ApiProperty({
    description: 'Percentage of approved students over total students',
    example: 62.5,
  })
  approvalRate!: number;

  @ApiProperty({
    description: 'Average score across all exam attempts',
    example: 78.4,
  })
  averageScore!: number;
}
