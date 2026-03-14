import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminExamConfigOptionDto {
  @ApiPropertyOptional({ example: 'a1b2c3d4', minLength: 1, maxLength: 64 })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  id?: string;

  @ApiProperty({ example: 'Option text', minLength: 1, maxLength: 300 })
  @IsString()
  @Length(1, 300)
  label!: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isCorrect!: boolean;
}

export class AdminExamConfigQuestionDto {
  @ApiPropertyOptional({ example: '12' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  id?: string;

  @ApiProperty({ example: 'What is NestJS?', minLength: 5, maxLength: 500 })
  @IsString()
  @Length(5, 500)
  text!: string;

  @ApiProperty({ minimum: 1, example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  position!: number;

  @ApiProperty({ type: [AdminExamConfigOptionDto] })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => AdminExamConfigOptionDto)
  options!: AdminExamConfigOptionDto[];
}

export class UpdateAdminExamConfigDto {
  @ApiProperty({ example: 'GMC Theory Mock Exam', minLength: 3, maxLength: 160 })
  @IsString()
  @Length(3, 160)
  title!: string;

  @ApiProperty({
    example: 'Practice exam for driving license preparation',
    minLength: 3,
    maxLength: 500,
  })
  @IsString()
  @Length(3, 500)
  description!: string;

  @ApiProperty({ example: 70, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(100)
  passScore!: number;

  @ApiProperty({ type: [AdminExamConfigQuestionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdminExamConfigQuestionDto)
  questions!: AdminExamConfigQuestionDto[];
}

export class AdminExamConfigResponseOptionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  isCorrect!: boolean;
}

export class AdminExamConfigResponseQuestionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  text!: string;

  @ApiProperty()
  position!: number;

  @ApiProperty({ type: [AdminExamConfigResponseOptionDto] })
  options!: AdminExamConfigResponseOptionDto[];
}

export class AdminExamConfigResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  passScore!: number;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty()
  updatedByName!: string;

  @ApiProperty({ type: [AdminExamConfigResponseQuestionDto] })
  questions!: AdminExamConfigResponseQuestionDto[];
}
