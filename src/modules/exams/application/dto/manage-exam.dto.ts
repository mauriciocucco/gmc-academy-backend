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
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ManageExamQuestionOptionDto {
  @ApiProperty({ example: 'a', minLength: 1, maxLength: 10 })
  @IsString()
  @Length(1, 10)
  id!: string;

  @ApiProperty({ example: 'Option text', minLength: 1, maxLength: 300 })
  @IsString()
  @Length(1, 300)
  label!: string;
}

export class ManageExamQuestionDto {
  @ApiProperty({ example: 'What is NestJS?', minLength: 5, maxLength: 500 })
  @IsString()
  @Length(5, 500)
  questionText!: string;

  @ApiProperty({ type: [ManageExamQuestionOptionDto] })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => ManageExamQuestionOptionDto)
  options!: ManageExamQuestionOptionDto[];

  @ApiProperty({ example: 'a', description: 'ID of the correct option' })
  @IsString()
  @Length(1, 10)
  correctOption!: string;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  position?: number;
}

export class CreateExamDto {
  @ApiProperty({ example: 'NestJS Fundamentals', minLength: 3, maxLength: 160 })
  @IsString()
  @Length(3, 160)
  title!: string;

  @ApiProperty({
    example: 'Test your NestJS knowledge',
    minLength: 3,
    maxLength: 500,
  })
  @IsString()
  @Length(3, 500)
  description!: string;

  @ApiProperty({ example: 70, minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  passScore!: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: [ManageExamQuestionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ManageExamQuestionDto)
  questions!: ManageExamQuestionDto[];
}

export class UpdateExamDto {
  @ApiPropertyOptional({ minLength: 3, maxLength: 160 })
  @IsOptional()
  @IsString()
  @Length(3, 160)
  title?: string;

  @ApiPropertyOptional({ minLength: 3, maxLength: 500 })
  @IsOptional()
  @IsString()
  @Length(3, 500)
  description?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  passScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [ManageExamQuestionDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ManageExamQuestionDto)
  questions?: ManageExamQuestionDto[];
}
