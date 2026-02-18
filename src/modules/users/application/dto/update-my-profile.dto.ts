import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';

export class UpdateMyProfileDto {
  @ApiPropertyOptional({
    example: 'Lucia Fernandez',
    description: 'Display name for the student',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @Length(2, 120)
  fullName?: string;

  @ApiPropertyOptional({
    example: '+5491122334455',
    nullable: true,
    description: 'Phone number in E.164 format. Send null to clear it.',
  })
  @Transform(({ value }: { value: unknown }) => {
    if (value === null) {
      return null;
    }
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @Matches(/^\+?[1-9]\d{6,14}$/, {
    message: 'phone must be a valid phone number in E.164 format',
  })
  phone?: string | null;

  @ApiPropertyOptional({
    example: 'student@gmc.com',
    description: 'Contact email used for login',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @IsEmail()
  email?: string;
}
