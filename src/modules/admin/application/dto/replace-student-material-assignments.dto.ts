import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StudentMaterialAssignmentItemDto {
  @ApiProperty({ description: 'Assigned material ID' })
  @IsString()
  materialId!: string;

  @ApiProperty({
    description: 'Display order for this student',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  position!: number;
}

export class ReplaceStudentMaterialAssignmentsDto {
  @ApiProperty({
    description: 'Full replacement of the student material assignments',
    type: [StudentMaterialAssignmentItemDto],
  })
  @IsArray()
  @ArrayUnique(
    (assignment: StudentMaterialAssignmentItemDto) => assignment.materialId,
  )
  @ValidateNested({ each: true })
  @Type(() => StudentMaterialAssignmentItemDto)
  assignments!: StudentMaterialAssignmentItemDto[];
}
