import { ApiProperty } from '@nestjs/swagger';

export class SubmitExamResponseDto {
  @ApiProperty()
  attemptId!: string;

  @ApiProperty()
  score!: number;

  @ApiProperty()
  passed!: boolean;

  @ApiProperty()
  correctAnswers!: number;

  @ApiProperty()
  totalQuestions!: number;

  @ApiProperty({ nullable: true })
  certificateCode!: string | null;
}
