import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateAdminStudentsAccessDto {
  @ApiProperty({
    type: [String],
    description: 'Student user IDs to block or unblock',
    example: ['42', '43'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  @Length(1, 50, { each: true })
  studentIds!: string[];

  @ApiProperty({
    description: 'Whether the selected students should be blocked',
    example: true,
  })
  @IsBoolean()
  blocked!: boolean;

  @ApiPropertyOptional({
    description: 'Optional admin reason recorded when blocking access',
    example: 'Pago pendiente',
    nullable: true,
  })
  @Transform(({ value }: { value: unknown }) => {
    if (value === null || value === undefined) {
      return value;
    }
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  reason?: string | null;
}

export class AdminStudentAccessResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  blocked!: boolean;

  @ApiProperty({ nullable: true, format: 'date-time' })
  blockedAt!: string | null;

  @ApiProperty({ nullable: true })
  blockReason!: string | null;
}

export class UpdateAdminStudentsAccessResponseDto {
  @ApiProperty({ type: [AdminStudentAccessResponseDto] })
  items!: AdminStudentAccessResponseDto[];
}
