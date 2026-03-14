import { ApiProperty } from '@nestjs/swagger';

export class AttemptResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  examId!: string;

  @ApiProperty()
  examTitle!: string;

  @ApiProperty()
  score!: number;

  @ApiProperty()
  passed!: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class AttemptReviewOptionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  label!: string;
}

export class AttemptReviewQuestionDto {
  @ApiProperty()
  questionId!: string;

  @ApiProperty()
  questionText!: string;

  @ApiProperty()
  position!: number;

  @ApiProperty({ type: [AttemptReviewOptionDto] })
  options!: AttemptReviewOptionDto[];

  @ApiProperty({ nullable: true })
  selectedOptionId!: string | null;

  @ApiProperty({ nullable: true })
  selectedOptionLabel!: string | null;

  @ApiProperty()
  correctOptionId!: string;

  @ApiProperty({ nullable: true })
  correctOptionLabel!: string | null;

  @ApiProperty()
  isCorrect!: boolean;
}

export class AttemptDetailResponseDto extends AttemptResponseDto {
  @ApiProperty()
  correctAnswers!: number;

  @ApiProperty()
  totalQuestions!: number;

  @ApiProperty({ type: [AttemptReviewQuestionDto] })
  questions!: AttemptReviewQuestionDto[];
}
