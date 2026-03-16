import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { MaterialResponseDto } from './material-response.dto';

export enum AdminMaterialPublishedStatusFilter {
  ALL = 'all',
  PUBLISHED = 'published',
  DRAFT = 'draft',
}

export class ListAdminMaterialsQueryDto {
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
    description: 'Search by title, description, category, link label or link URL',
    example: 'teorica',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by material category ID',
    example: '3',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @Length(1, 50)
  categoryId?: string;

  @ApiPropertyOptional({
    enum: AdminMaterialPublishedStatusFilter,
    default: AdminMaterialPublishedStatusFilter.ALL,
  })
  @IsOptional()
  @IsEnum(AdminMaterialPublishedStatusFilter)
  publishedStatus?: AdminMaterialPublishedStatusFilter =
    AdminMaterialPublishedStatusFilter.ALL;
}

export class AdminMaterialListMetaResponseDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty()
  totalItems!: number;

  @ApiProperty()
  totalPages!: number;
}

export class ListAdminMaterialsResponseDto {
  @ApiProperty({ type: [MaterialResponseDto] })
  items!: MaterialResponseDto[];

  @ApiProperty({ type: AdminMaterialListMetaResponseDto })
  meta!: AdminMaterialListMetaResponseDto;
}
