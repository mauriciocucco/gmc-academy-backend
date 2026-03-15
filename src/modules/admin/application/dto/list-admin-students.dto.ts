import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export enum AdminStudentStatusFilter {
  ALL = 'all',
  APPROVED = 'approved',
  PENDING = 'pending',
}

export enum AdminStudentAttemptStateFilter {
  ALL = 'all',
  WITH_ATTEMPT = 'with-attempt',
  WITHOUT_ATTEMPT = 'without-attempt',
}

export enum AdminStudentAccessStatusFilter {
  ALL = 'all',
  ACTIVE = 'active',
  BLOCKED = 'blocked',
}

export class ListAdminStudentsQueryDto {
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
    description: 'Search by student full name or email',
    example: 'lucia',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;

  @ApiPropertyOptional({
    enum: AdminStudentStatusFilter,
    default: AdminStudentStatusFilter.ALL,
  })
  @IsOptional()
  @IsEnum(AdminStudentStatusFilter)
  status?: AdminStudentStatusFilter = AdminStudentStatusFilter.ALL;

  @ApiPropertyOptional({
    enum: AdminStudentAttemptStateFilter,
    default: AdminStudentAttemptStateFilter.ALL,
  })
  @IsOptional()
  @IsEnum(AdminStudentAttemptStateFilter)
  attemptState?: AdminStudentAttemptStateFilter =
    AdminStudentAttemptStateFilter.ALL;

  @ApiPropertyOptional({
    enum: AdminStudentAccessStatusFilter,
    default: AdminStudentAccessStatusFilter.ALL,
  })
  @IsOptional()
  @IsEnum(AdminStudentAccessStatusFilter)
  accessStatus?: AdminStudentAccessStatusFilter =
    AdminStudentAccessStatusFilter.ALL;
}

export class AdminStudentListMetaResponseDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty()
  totalItems!: number;

  @ApiProperty()
  totalPages!: number;
}

export class AdminStudentListItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ nullable: true })
  lastAttemptScore!: number | null;

  @ApiProperty()
  approved!: boolean;

  @ApiProperty()
  blocked!: boolean;

  @ApiProperty({ nullable: true, format: 'date-time' })
  blockedAt!: string | null;
}

export class ListAdminStudentsResponseDto {
  @ApiProperty({ type: [AdminStudentListItemResponseDto] })
  items!: AdminStudentListItemResponseDto[];

  @ApiProperty({ type: AdminStudentListMetaResponseDto })
  meta!: AdminStudentListMetaResponseDto;
}
