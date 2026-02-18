import { ApiProperty } from '@nestjs/swagger';

class ExamQuestionOptionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  label!: string;
}

class ExamQuestionDetailDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  questionText!: string;

  @ApiProperty({ type: [ExamQuestionOptionDto] })
  options!: ExamQuestionOptionDto[];

  @ApiProperty()
  correctOption!: string;

  @ApiProperty()
  position!: number;
}

export class ExamSummaryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  passScore!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  questionCount!: number;

  @ApiProperty()
  createdAt!: string;
}

export class ExamDetailResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  passScore!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ type: [ExamQuestionDetailDto] })
  questions!: ExamQuestionDetailDto[];
}
