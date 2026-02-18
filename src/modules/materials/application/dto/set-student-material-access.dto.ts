import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetStudentMaterialAccessDto {
  @ApiProperty({ description: 'Enable or disable access for the student' })
  @IsBoolean()
  enabled!: boolean;
}
