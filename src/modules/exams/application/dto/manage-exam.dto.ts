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

export class ManageExamQuestionOptionDto {
  @IsString()
  @Length(1, 10)
  id!: string;

  @IsString()
  @Length(1, 300)
  label!: string;
}

export class ManageExamQuestionDto {
  @IsString()
  @Length(5, 500)
  questionText!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => ManageExamQuestionOptionDto)
  options!: ManageExamQuestionOptionDto[];

  @IsString()
  @Length(1, 10)
  correctOption!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  position?: number;
}

export class CreateExamDto {
  @IsString()
  @Length(3, 160)
  title!: string;

  @IsString()
  @Length(3, 500)
  description!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  passScore!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ManageExamQuestionDto)
  questions!: ManageExamQuestionDto[];
}

export class UpdateExamDto {
  @IsOptional()
  @IsString()
  @Length(3, 160)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(3, 500)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  passScore?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ManageExamQuestionDto)
  questions?: ManageExamQuestionDto[];
}
