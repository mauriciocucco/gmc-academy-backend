import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { AdminExamConfigResponseQuestionDto } from './admin-exam-config.dto';

export class ListAdminExamQuestionsQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional({
    description: 'Search by question text or option labels',
    example: 'senal',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;
}

export class AdminExamQuestionListMetaResponseDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty()
  totalItems!: number;

  @ApiProperty()
  totalPages!: number;
}

export class ListAdminExamQuestionsResponseDto {
  @ApiProperty()
  examId!: string;

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
  items!: AdminExamConfigResponseQuestionDto[];

  @ApiProperty({ type: AdminExamQuestionListMetaResponseDto })
  meta!: AdminExamQuestionListMetaResponseDto;
}
