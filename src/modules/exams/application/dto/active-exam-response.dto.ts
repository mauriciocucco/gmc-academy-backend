import { ApiProperty } from '@nestjs/swagger';

class ActiveExamOptionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  label!: string;
}

class ActiveExamQuestionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  text!: string;

  @ApiProperty({ type: [ActiveExamOptionDto] })
  options!: ActiveExamOptionDto[];

  @ApiProperty()
  position!: number;
}

export class ActiveExamResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  passScore!: number;

  @ApiProperty({ type: [ActiveExamQuestionDto] })
  questions!: ActiveExamQuestionDto[];
}
