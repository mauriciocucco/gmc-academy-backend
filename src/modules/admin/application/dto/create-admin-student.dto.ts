import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateAdminStudentDto {
  @ApiProperty({
    example: 'Juan Perez',
    description: 'Full name displayed in the academy platform',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(2, 120)
  fullName!: string;

  @ApiProperty({
    example: 'juan@email.com',
    description: 'Unique email used for login',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '+5491122334455',
    required: false,
    nullable: true,
    description: 'Optional phone number in E.164 format',
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
  @Matches(/^\+?[1-9]\d{6,14}$/, {
    message: 'phone must be a valid phone number in E.164 format',
  })
  phone?: string | null;
}

export class CreateAdminStudentResponseDto {
  @ApiProperty({ example: '42' })
  id!: string;

  @ApiProperty({ example: 'Juan Perez' })
  fullName!: string;

  @ApiProperty({ example: 'juan@email.com' })
  email!: string;

  @ApiProperty({ example: '+5491122334455', nullable: true })
  phone!: string | null;

  @ApiProperty({
    example: 'Abc12345',
    description: 'Temporary password returned only once at creation time',
  })
  temporaryPassword!: string;

  @ApiProperty({ example: true })
  mustChangePassword!: boolean;
}
