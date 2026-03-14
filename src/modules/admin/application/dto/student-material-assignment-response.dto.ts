import { ApiProperty } from '@nestjs/swagger';

export class StudentMaterialAssignmentResponseDto {
  @ApiProperty({ description: 'Assigned material ID' })
  materialId!: string;

  @ApiProperty({
    description: 'Display order for this student',
    minimum: 0,
  })
  position!: number;
}
