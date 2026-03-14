import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class UpdateAdminStudentNoteDto {
  @ApiProperty({
    description: 'Internal admin note for the student',
    example: 'Necesita refuerzo en prioridad de paso',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(1, 2000)
  content!: string;
}
