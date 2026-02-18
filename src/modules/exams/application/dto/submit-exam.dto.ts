import {
  ArrayMinSize,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @ApiProperty({ description: 'Question ID' })
  @IsString()
  questionId!: string;

  @ApiProperty({ description: 'Selected option ID' })
  @IsString()
  optionId!: string;
}

export class SubmitExamDto {
  @ApiProperty({ type: [SubmitAnswerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers!: SubmitAnswerDto[];
}
